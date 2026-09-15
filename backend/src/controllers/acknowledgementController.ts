import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';

export class AcknowledgementController {
  /**
   * Generates a new polite, empathetic acknowledgement draft for a complaint.
   */
  public static async generateDraft(req: Request, res: Response) {
    try {
      const { complaintId, channel = 'SMS', language = 'hi-en', operatorNotes } = req.body;
      if (!complaintId) {
        return sendError(res, 'complaintId is required to generate draft', 400);
      }

      const complaint = await prisma.complaint.findUnique({
        where: { id: complaintId },
      });

      if (!complaint) {
        return sendError(res, 'Complaint not found', 404);
      }

      const ticketRef = complaint.externalId || complaint.id.slice(0, 8);
      const loc = complaint.locality || 'your area';
      const cat = complaint.category || 'civic issue';
      const dept = complaint.department || 'the concerned municipal cell';

      // Empathetic draft text adhering strictly to Rule 4.6 (no claims of resolution, no claims of acceptance unless verified)
      let draftedText = '';
      if (language === 'hi') {
        draftedText = `प्रिय नागरिक, ${loc} में '${cat}' से संबंधित आपकी शिकायत संदर्भ संख्या [${ticketRef}] के साथ भोपाल नगर निगम के रिकॉर्ड में दर्ज कर ली गई है। इसे सत्यापन एवं आवश्यक कार्रवाई हेतु ${dept} को अग्रेषित किया गया है। - भोपाल नगर निगम (कॉल 181)`;
      } else if (language === 'en') {
        draftedText = `Dear Citizen, your complaint regarding '${cat}' in ${loc} has been recorded under reference [${ticketRef}]. It has been routed to ${dept} for inspection and follow-up. - Bhopal Municipal Corporation`;
      } else {
        // Bilingual Hindi/English
        draftedText = `प्रिय नागरिक, your complaint regarding '${cat}' in ${loc} has been recorded with reference [${ticketRef}]. संदर्भ संख्या [${ticketRef}] के तहत आपकी शिकायत दर्ज है एवं अग्रिम निरीक्षण हेतु प्रेषित की गई है। - Bhopal Municipal Corporation`;
      }

      const draft = await prisma.acknowledgementDraft.create({
        data: {
          complaintId: complaint.id,
          channel,
          language,
          templateCode: `ACK_${dept.replace(/\s+/g, '_').toUpperCase()}`,
          draftedText,
          status: 'DRAFT',
          editedBy: operatorNotes || null,
        },
      });

      await prisma.auditLog.create({
        data: {
          complaintId: complaint.id,
          action: 'ACKNOWLEDGEMENT_DRAFT_CREATED',
          actor: 'OPERATOR_CONSOLE',
          details: `Generated ${channel} draft in ${language} language.`,
          newVal: { draftId: draft.id, channel, status: 'DRAFT' },
        },
      });

      return sendSuccess(res, draft, 'Acknowledgement draft generated successfully');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  /**
   * Approves a draft after operator review.
   */
  public static async approveDraft(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { reviewedBy, revisedText } = req.body;

      const existing = await prisma.acknowledgementDraft.findUnique({
        where: { id },
      });

      if (!existing) {
        return sendError(res, `Draft not found with ID: ${id}`, 404);
      }

      const updated = await prisma.acknowledgementDraft.update({
        where: { id },
        data: {
          status: 'OPERATOR_APPROVED',
          draftedText: revisedText || existing.draftedText,
          editedBy: reviewedBy || 'Operator-BPL-ZoneHQ',
        },
      });

      await prisma.auditLog.create({
        data: {
          complaintId: existing.complaintId,
          action: 'ACKNOWLEDGEMENT_DRAFT_APPROVED',
          actor: reviewedBy || 'Operator-BPL-ZoneHQ',
          details: `Operator approved draft ${id}. Ready for manual dispatch via official channels.`,
          newVal: { status: 'OPERATOR_APPROVED', text: updated.draftedText },
        },
      });

      return sendSuccess(res, updated, 'Acknowledgement draft approved and ready for dispatch');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  /**
   * Rejects / discards a draft.
   */
  public static async rejectDraft(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { reviewedBy, reason } = req.body;

      const existing = await prisma.acknowledgementDraft.findUnique({
        where: { id },
      });

      if (!existing) {
        return sendError(res, `Draft not found with ID: ${id}`, 404);
      }

      const updated = await prisma.acknowledgementDraft.update({
        where: { id },
        data: {
          status: 'REJECTED',
          editedBy: reviewedBy || 'Operator-BPL-ZoneHQ',
        },
      });

      await prisma.auditLog.create({
        data: {
          complaintId: existing.complaintId,
          action: 'ACKNOWLEDGEMENT_DRAFT_REJECTED',
          actor: reviewedBy || 'Operator-BPL-ZoneHQ',
          details: `Draft ${id} rejected: ${reason || 'Not suitable for dispatch.'}`,
          newVal: { status: 'REJECTED' },
        },
      });

      return sendSuccess(res, updated, 'Acknowledgement draft marked as rejected');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }
}

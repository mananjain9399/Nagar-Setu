import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { EvaluationBenchmarkResult } from '../../types';
import {
  Award,
  BarChart3,
  RotateCcw,
} from 'lucide-react';

export const EvaluationDashboardView: React.FC = () => {
  const [evaluation, setEvaluation] = useState<EvaluationBenchmarkResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    loadEvaluation();
  }, []);

  const loadEvaluation = async () => {
    setLoading(true);
    try {
      const data = await api.getEvaluationBenchmark();
      setEvaluation(data);
    } catch (err) {
      console.error('Failed to load evaluation benchmark:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunEvaluation = async () => {
    setRunning(true);
    try {
      const data = await api.getEvaluationBenchmark();
      setEvaluation(data);
    } catch (err) {
      console.error('Evaluation benchmark error:', err);
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-md p-12 text-center text-xs text-slate-500 shadow-xs">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-3" />
        <p className="text-slate-700 font-medium">Evaluating pipeline on held-out benchmark dataset...</p>
      </div>
    );
  }

  if (!evaluation) return null;

  const { routingMetrics, urgencyMetrics, duplicateMetrics, localityMetrics, humanReviewMetrics, pipelineFunnel } =
    evaluation;

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-md p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              HELD-OUT BENCHMARK EVALUATION
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-bold">
              DATASET: held_out_test.csv ({evaluation.datasetInfo.totalTestRecords} records)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Strictly computed evaluation metrics on held-out test data. Mathematical accuracy, precision, recall, F1, and confusion matrices.
          </p>
        </div>

        <button
          onClick={handleRunEvaluation}
          disabled={running}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded shadow-xs transition-colors disabled:opacity-50 self-start sm:self-auto cursor-pointer"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${running ? 'animate-spin' : ''}`} />
          <span>{running ? 'Benchmarking...' : 'Re-Run Evaluation'}</span>
        </button>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-md p-3.5 space-y-0.5 shadow-xs border-t-2 border-t-emerald-600">
          <span className="text-[10px] uppercase font-mono text-slate-500 font-semibold">Routing Accuracy</span>
          <div className="text-2xl font-bold font-mono text-emerald-700">
            {routingMetrics.overallDepartmentAccuracy}%
          </div>
          <span className="text-[10px] text-slate-400 block font-mono">
            Category Match: {routingMetrics.categoryAccuracy}%
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-3.5 space-y-0.5 shadow-xs border-t-2 border-t-blue-600">
          <span className="text-[10px] uppercase font-mono text-slate-500 font-semibold">Urgency Assessment F1</span>
          <div className="text-2xl font-bold font-mono text-blue-700">
            {urgencyMetrics.f1Score}%
          </div>
          <span className="text-[10px] text-slate-400 block font-mono">
            Precision: {urgencyMetrics.precision}% | Recall: {urgencyMetrics.recall}%
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-3.5 space-y-0.5 shadow-xs border-t-2 border-t-indigo-600">
          <span className="text-[10px] uppercase font-mono text-slate-500 font-semibold">Duplicate Detection F1</span>
          <div className="text-2xl font-bold font-mono text-indigo-700">
            {duplicateMetrics.f1Score}%
          </div>
          <span className="text-[10px] text-slate-400 block font-mono">
            Ticket Reduction: {duplicateMetrics.ticketReductionPercentage}%
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-3.5 space-y-0.5 shadow-xs border-t-2 border-t-amber-500">
          <span className="text-[10px] uppercase font-mono text-slate-500 font-semibold">Locality Grounding</span>
          <div className="text-2xl font-bold font-mono text-amber-700">
            {localityMetrics.localityMatchAccuracy}%
          </div>
          <span className="text-[10px] text-slate-400 block font-mono">
            Ward Match: {localityMetrics.wardMatchAccuracy}% | Review: {localityMetrics.unknownOrReviewRate}%
          </span>
        </div>
      </div>

      {/* Pipeline Funnel Progression */}
      <div className="bg-white border border-slate-200 rounded-md p-4 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Pipeline Funnel Metrics (Active Ingestion & Processing)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500">END-TO-END TRACE</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 text-center text-xs">
          <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
            <span className="text-[10px] font-mono text-slate-500 block uppercase">1. Imported</span>
            <span className="text-lg font-bold font-mono text-slate-800">{pipelineFunnel.totalImported}</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
            <span className="text-[10px] font-mono text-slate-500 block uppercase">2. Processed</span>
            <span className="text-lg font-bold font-mono text-blue-700">{pipelineFunnel.processed}</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
            <span className="text-[10px] font-mono text-slate-500 block uppercase">3. Classified</span>
            <span className="text-lg font-bold font-mono text-blue-700">{pipelineFunnel.classified}</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
            <span className="text-[10px] font-mono text-slate-500 block uppercase">4. Locality</span>
            <span className="text-lg font-bold font-mono text-blue-700">{pipelineFunnel.localityMapped}</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
            <span className="text-[10px] font-mono text-slate-500 block uppercase">5. Duplicates</span>
            <span className="text-lg font-bold font-mono text-indigo-700">{pipelineFunnel.duplicateChecked}</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
            <span className="text-[10px] font-mono text-slate-500 block uppercase">6. Reviewed</span>
            <span className="text-lg font-bold font-mono text-amber-700">{pipelineFunnel.humanReviewed}</span>
          </div>
          <div className="p-2.5 bg-emerald-50 rounded border border-emerald-200">
            <span className="text-[10px] font-mono text-emerald-800 block uppercase font-bold">7. Final</span>
            <span className="text-lg font-bold font-mono text-emerald-700">{pipelineFunnel.finalTickets}</span>
          </div>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Per-Department Accuracy */}
        <div className="bg-white border border-slate-200 rounded-md p-4 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Department Classification Breakdown
            </h3>
            <span className="text-[10px] font-mono text-slate-500">ROUTING RELIABILITY</span>
          </div>

          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            {Object.entries(routingMetrics.perDepartmentAccuracy).map(([dept, stat], idx) => (
              <div key={idx} className="p-2 bg-slate-50 rounded border border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800 block">{dept}</span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {stat.correct} / {stat.total} correctly routed
                  </span>
                </div>
                <div className="text-right font-mono font-bold">
                  <span
                    className={
                      stat.accuracy >= 80
                        ? 'text-emerald-700'
                        : stat.accuracy >= 50
                        ? 'text-amber-700'
                        : 'text-rose-700'
                    }
                  >
                    {stat.accuracy}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Urgency Evaluation Breakdown */}
        <div className="bg-white border border-slate-200 rounded-md p-4 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Urgency Criteria Performance Breakdown
            </h3>
            <span className="text-[10px] font-mono text-slate-500">PRECISION / RECALL</span>
          </div>

          <div className="space-y-1.5">
            {Object.entries(urgencyMetrics.tierBreakdown).map(([tier, stat], idx) => (
              <div key={idx} className="p-2 bg-slate-50 rounded border border-slate-200 text-xs flex items-center justify-between">
                <span className="font-mono font-bold text-slate-800">{tier}</span>
                <div className="flex items-center gap-3 text-slate-600 font-mono text-[11px]">
                  <span>P: <strong className="text-slate-800">{stat.precision}%</strong></span>
                  <span>R: <strong className="text-slate-800">{stat.recall}%</strong></span>
                  <span>F1: <strong className="text-blue-700">{stat.f1}%</strong></span>
                </div>
              </div>
            ))}
          </div>

          {/* Human Review Metrics Card */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs text-slate-600 space-y-1">
            <span className="text-[10px] uppercase font-mono text-slate-500 font-semibold block">Operator Review Behavior:</span>
            <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono text-slate-700">
              <div>Review Trigger Rate: <span className="text-amber-700 font-semibold">{humanReviewMetrics.reviewRequiredRate}%</span></div>
              <div>Accepted As-Is: <span className="text-emerald-700 font-semibold">{humanReviewMetrics.acceptedWithoutChangesEstimate}%</span></div>
              <div>Modified by Officer: <span className="text-blue-700 font-semibold">{humanReviewMetrics.modifiedByOperatorEstimate}%</span></div>
              <div>Rejected: <span className="text-rose-700 font-semibold">{humanReviewMetrics.rejectedEstimate}%</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { EvaluationBenchmarkResult } from '../../types';
import {
  Award,
  Play,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Layers,
  Filter,
  BarChart3,
  TrendingUp,
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
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center text-xs text-slate-400">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full mb-3" />
        <p className="text-slate-300 font-medium">Evaluating pipeline on held-out benchmark dataset...</p>
      </div>
    );
  }

  if (!evaluation) return null;

  const { routingMetrics, urgencyMetrics, duplicateMetrics, localityMetrics, humanReviewMetrics, pipelineFunnel } =
    evaluation;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-slate-100">Held-Out Benchmark Evaluation</h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
              DATASET: held_out_test.csv ({evaluation.datasetInfo.totalTestRecords} records)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Strictly computed evaluation metrics on held-out test data. Mathematical accuracy, precision, recall, F1, and confusion matrices.
          </p>
        </div>

        <button
          onClick={handleRunEvaluation}
          disabled={running}
          className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded shadow transition-colors disabled:opacity-50 self-start sm:self-auto"
        >
          <RotateCcw className={`w-4 h-4 ${running ? 'animate-spin' : ''}`} />
          <span>{running ? 'Benchmarking...' : 'Re-Run Evaluation'}</span>
        </button>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-1">
          <span className="text-[10px] uppercase font-mono text-slate-500">Department Routing Accuracy</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-emerald-400">
              {routingMetrics.overallDepartmentAccuracy}%
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block font-mono">
            Category Match: {routingMetrics.categoryAccuracy}%
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-1">
          <span className="text-[10px] uppercase font-mono text-slate-500">Urgency Assessment F1</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-sky-400">
              {urgencyMetrics.f1Score}%
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block font-mono">
            Precision: {urgencyMetrics.precision}% | Recall: {urgencyMetrics.recall}%
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-1">
          <span className="text-[10px] uppercase font-mono text-slate-500">Duplicate Detection F1</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-purple-400">
              {duplicateMetrics.f1Score}%
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block font-mono">
            Ticket Reduction: {duplicateMetrics.ticketReductionPercentage}%
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-1">
          <span className="text-[10px] uppercase font-mono text-slate-500">Locality Grounding Match</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-amber-400">
              {localityMetrics.localityMatchAccuracy}%
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block font-mono">
            Ward Match: {localityMetrics.wardMatchAccuracy}% | Review: {localityMetrics.unknownOrReviewRate}%
          </span>
        </div>
      </div>

      {/* Pipeline Funnel Progression (5.6) */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-sky-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Pipeline Funnel Metrics (Active Ingestion & Processing)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">End-to-End Operational Trace</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 text-center text-xs">
          <div className="p-3 bg-slate-950 rounded border border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 block uppercase">1. Imported</span>
            <span className="text-xl font-bold font-mono text-slate-200">{pipelineFunnel.totalImported}</span>
          </div>
          <div className="p-3 bg-slate-950 rounded border border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 block uppercase">2. Processed</span>
            <span className="text-xl font-bold font-mono text-sky-400">{pipelineFunnel.processed}</span>
          </div>
          <div className="p-3 bg-slate-950 rounded border border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 block uppercase">3. Classified</span>
            <span className="text-xl font-bold font-mono text-sky-400">{pipelineFunnel.classified}</span>
          </div>
          <div className="p-3 bg-slate-950 rounded border border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 block uppercase">4. Locality</span>
            <span className="text-xl font-bold font-mono text-sky-400">{pipelineFunnel.localityMapped}</span>
          </div>
          <div className="p-3 bg-slate-950 rounded border border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 block uppercase">5. Duplicates</span>
            <span className="text-xl font-bold font-mono text-purple-400">{pipelineFunnel.duplicateChecked}</span>
          </div>
          <div className="p-3 bg-slate-950 rounded border border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 block uppercase">6. Reviewed</span>
            <span className="text-xl font-bold font-mono text-amber-400">{pipelineFunnel.humanReviewed}</span>
          </div>
          <div className="p-3 bg-slate-950 rounded border border-emerald-900/60 bg-emerald-950/20">
            <span className="text-[10px] font-mono text-emerald-400 block uppercase font-bold">7. Final</span>
            <span className="text-xl font-bold font-mono text-emerald-300">{pipelineFunnel.finalTickets}</span>
          </div>
        </div>
      </div>

      {/* Confusion Matrix & Department Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Per-Department Accuracy */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Per-Department Classification Breakdown
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Routing Reliability</span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {Object.entries(routingMetrics.perDepartmentAccuracy).map(([dept, stat], idx) => (
              <div key={idx} className="p-2.5 bg-slate-950 rounded border border-slate-800 text-xs flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200 block">{dept}</span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {stat.correct} / {stat.total} correctly routed
                  </span>
                </div>
                <div className="text-right font-mono font-bold">
                  <span
                    className={
                      stat.accuracy >= 80
                        ? 'text-emerald-400'
                        : stat.accuracy >= 50
                        ? 'text-amber-400'
                        : 'text-rose-400'
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
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Urgency Criteria Performance Breakdown
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Safety / Outage / Duration</span>
          </div>

          <div className="space-y-2">
            {Object.entries(urgencyMetrics.tierBreakdown).map(([tier, stat], idx) => (
              <div key={idx} className="p-2.5 bg-slate-950 rounded border border-slate-800 text-xs flex items-center justify-between">
                <span className="font-mono font-bold text-slate-200">{tier}</span>
                <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
                  <span>P: <span className="text-slate-200">{stat.precision}%</span></span>
                  <span>R: <span className="text-slate-200">{stat.recall}%</span></span>
                  <span>F1: <span className="text-sky-400 font-bold">{stat.f1}%</span></span>
                </div>
              </div>
            ))}
          </div>

          {/* Human Review Metrics Card */}
          <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 space-y-1">
            <span className="text-[10px] uppercase font-mono text-slate-500 block">Operator Review Behavior:</span>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
              <div>Review Trigger Rate: <span className="text-amber-400">{humanReviewMetrics.reviewRequiredRate}%</span></div>
              <div>Accepted Without Changes: <span className="text-emerald-400">{humanReviewMetrics.acceptedWithoutChangesEstimate}%</span></div>
              <div>Modified by Operator: <span className="text-sky-400">{humanReviewMetrics.modifiedByOperatorEstimate}%</span></div>
              <div>Rejected: <span className="text-rose-400">{humanReviewMetrics.rejectedEstimate}%</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

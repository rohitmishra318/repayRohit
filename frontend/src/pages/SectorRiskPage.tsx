import { usePortfolio } from '../hooks';
import { PageHeader } from '../components/layout/PageHeader';
import { SectorTable } from '../components/portfolio/SectorTable';
import { Card } from '../components/shared/Card';
import { Spinner } from '../components/shared/Spinner';

export function SectorRiskPage() {
  const { data: portfolio, isLoading } = usePortfolio();

  if (isLoading) return <Spinner label="Loading portfolio data..." size="lg" />;
  if (!portfolio) return <p className="p-6 text-slate-400 dark:text-slate-500">Failed to load portfolio data.</p>;

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin bg-slate-50 dark:bg-slate-950">
      <PageHeader
        title="Sector Risk Exposure"
        subtitle="Detailed breakdown of portfolio risk across target industries"
      />

      <div className="p-6 max-w-screen-xl mx-auto space-y-5">
        <Card className="flex flex-col h-full min-h-[500px]" padding="md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Sector Analysis</h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">{portfolio.sector_exposure.length} active sectors</span>
          </div>



          <div className="flex-1 min-h-0 bg-slate-50 dark:bg-slate-900 rounded-lg p-2 border border-slate-100 dark:border-slate-800">
            <SectorTable data={portfolio.sector_exposure} />
          </div>
        </Card>
      </div>
    </div>
  );
}

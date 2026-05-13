import { usePortfolio } from '../hooks';
import { PageHeader } from '../components/layout/PageHeader';
import { StressTest } from '../components/portfolio/StressTest';
import { Card } from '../components/shared/Card';
import { Spinner } from '../components/shared/Spinner';

export function StressTestPage() {
  const { data: portfolio, isLoading } = usePortfolio();

  if (isLoading) return <Spinner label="Loading portfolio data..." size="lg" />;
  if (!portfolio) return <p className="p-6 text-slate-400 dark:text-slate-500">Failed to load portfolio data.</p>;

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin bg-slate-50 dark:bg-slate-950">
      <PageHeader
        title="Scenario Stress Test"
        subtitle="Simulate market demand shocks to calculate portfolio impact"
      />
      
      <div className="p-6 max-w-screen-xl mx-auto">
        <Card className="flex flex-col h-full min-h-[600px] max-w-4xl mx-auto" padding="lg">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-2">Demand Shock Simulator</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Adjust the sliders below to simulate a drop in industry hiring demand. The simulator calculates the estimated increase in the average risk score for each sector based on your inputs.
            </p>
          </div>
          
          <div className="flex-1 min-h-0">
            {portfolio.sector_exposure.length > 0 ? (
              <StressTest sectors={portfolio.sector_exposure} />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                No sector data available for simulation.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

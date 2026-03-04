import Link from 'next/link';
import tiers from '@/config/tiers.json';

function formatThreshold(value: number, unit: string): string {
  if (unit === 'USD') {
    if (value >= 1000000) return `$${value / 1000000}M`;
    if (value >= 1000) return `$${value / 1000}K`;
    return `$${value}`;
  }
  return value.toString();
}

function CategorySection({
  name,
  description,
  tierData,
  unit,
}: {
  name: string;
  description: string;
  tierData: { threshold: number; xp: number }[];
  unit: string;
}) {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold">{name}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-border rounded-lg">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-3 py-2 text-left font-medium">Threshold</th>
              <th className="px-3 py-2 text-right font-medium">XP</th>
            </tr>
          </thead>
          <tbody>
            {tierData.map((tier, index) => (
              <tr key={index} className="border-t border-border">
                <td className="px-3 py-2">
                  {formatThreshold(tier.threshold, unit)}+{' '}
                  {unit !== 'USD' && (
                    <span className="text-muted-foreground">{unit}</span>
                  )}
                </td>
                <td className="px-3 py-2 text-right font-mono">{tier.xp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function HowItWorksPage() {
  const categories = tiers.categories;

  return (
    <main className="min-h-screen flex flex-col items-center p-8">
      <div className="w-full max-w-lg space-y-8">
        {/* Top navigation */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; Back to tracker
        </Link>

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">How XP Works</h1>
          <p className="text-muted-foreground">
            Jumper rewards you with XP each month based on your activity
          </p>
        </div>

        {/* Category sections */}
        <div className="space-y-6">
          {categories.map((category) => (
            <CategorySection
              key={category.id}
              name={category.displayName}
              description={category.description}
              tierData={category.tiers}
              unit={category.unit}
            />
          ))}
        </div>

        {/* Notes */}
        <div className="text-sm text-muted-foreground space-y-2">
          <p>XP is calculated monthly. Higher tiers earn more XP.</p>
          <p>Only transactions through Jumper Exchange are counted.</p>
        </div>

        {/* Back link */}
        <div className="text-center pt-4">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            Back to tracker
          </Link>
        </div>
      </div>
    </main>
  );
}

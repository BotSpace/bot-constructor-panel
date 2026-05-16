import { formatCurrency } from "@/lib/format-currency";

interface BalanceCardProps {
  balance: number;
  templateBalance?: string;
}

export function BalanceCard({ balance, templateBalance }: BalanceCardProps) {
  const templateBalanceNum = templateBalance ? parseFloat(templateBalance) : 0;

  return (

    <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 lg:p-8 shadow-sm hover:shadow-md transition-shadow">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="min-w-0">
          <p className="mb-2 text-sm text-muted-foreground">Mavjud balans</p>

          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="break-words text-2xl sm:text-5xl font-bold text-foreground">
              {formatCurrency(balance)}
            </span>
            <span className="text-base sm:text-lg text-muted-foreground">UZS</span>
          </div>
        </div>

        {templateBalance && templateBalanceNum > 0 && (
          <div className="min-w-0 md:text-right">
            <p className="mb-2 text-sm text-muted-foreground">Shablon daromadi</p>

            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 md:justify-end">
              <span className="break-words text-3xl sm:text-4xl lg:text-5xl font-bold text-primary">
                {formatCurrency(templateBalanceNum)}
              </span>
              <span className="text-base sm:text-lg text-muted-foreground">UZS</span>
            </div>
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Maʼlumotlar har 15 soniyada avtomatik yangilanadi
      </p>
    </div>

  );
}

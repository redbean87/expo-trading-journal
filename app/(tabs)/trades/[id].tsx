import { useBreakpoint } from '@/hooks/use-breakpoint';
import TradeDetailScreen from '@/screens/trade-detail-screen';
import TradesScreen from '@/screens/trades-screen';

export default function TradeIdRoute() {
  const { isDesktop } = useBreakpoint();

  if (isDesktop) {
    return <TradesScreen />;
  }

  return <TradeDetailScreen />;
}

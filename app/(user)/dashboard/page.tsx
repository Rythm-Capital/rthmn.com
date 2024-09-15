import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { oxanium } from '@/app/fonts';
import HistogramBox from './HistogramBox';

interface BoxSlice {
  timestamp: string;
  boxes: Array<{
    high: number;
    low: number;
    value: number;
    size: number;
  }>;
  currentOHLC: {
    open: number;
    high: number;
    low: number;
    close: number;
  };
}

function isActualData(slice: BoxSlice): boolean {
  return slice.boxes.some((box) => box.high !== 1);
}

function extractActualData(data: BoxSlice[]): BoxSlice[] {
  return Array.isArray(data) ? data.filter(isActualData) : [];
}

async function getBoxSlices(pair: string) {
  try {
    const response = await fetch(`http://localhost:8080/boxslices/${pair}`);
    const data = await response.json();
    console.log('Raw data from server:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Error fetching box slices:', error);
    return { status: 'error', message: 'Failed to fetch box slices' };
  }
}

export default async function Dashboard() {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        }
      }
    }
  );

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signin');
  }

  const { data: subscriptionData, error: subscriptionError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (subscriptionError) {
    console.error('Error fetching subscription data:', subscriptionError);
  }

  const boxSlicesData = await getBoxSlices('USD_JPY');
  const actualData = Array.isArray(boxSlicesData)
    ? extractActualData(boxSlicesData)
    : [];
  console.log(
    'Actual data for HistogramBox:',
    JSON.stringify(actualData, null, 2)
  );

  return (
    <div className={`w-full sm:px-6 lg:px-8 ${oxanium.className}`}>
      <h1 className="mb-6 pt-32 text-3xl font-bold">Trading Dashboard</h1>

      <div className="mb-6">
        <h2 className="mb-4 text-xl font-semibold">
          Box Slices Histogram (USD_JPY)
        </h2>
        <p className="mb-2">Total Box Slices: {actualData.length}</p>
        <div className="fixed bottom-0 w-full">
          <HistogramBox data={actualData} isLoading={false} />
        </div>
      </div>
    </div>
  );
}

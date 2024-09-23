import { BoxSlice } from '@/types';

interface ApiResponse {
  status: string;
  data: Array<{
    timestamp: string;
    boxes: number[];
  }>;
}

export async function getBoxSlices(
  pair: string,
  lastTimestamp?: string,
  limit?: number
): Promise<BoxSlice[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080';
  let url = `${baseUrl}/processed-boxslices/${pair}`;

  const params = new URLSearchParams();
  if (lastTimestamp) params.append('lastTimestamp', lastTimestamp);
  if (limit) params.append('limit', limit.toString());

  if (params.toString()) url += `?${params.toString()}`;

  try {
    console.log(`Fetching from: ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      return [];
    }
    const apiResponse: ApiResponse = await response.json();
    console.log('Received data:', apiResponse);

    if (apiResponse.status !== 'success' || !Array.isArray(apiResponse.data)) {
      console.error('Invalid API response:', apiResponse);
      return [];
    }

    // Transform the data to match the BoxSlice type
    const transformedData: BoxSlice[] = apiResponse.data.map((item) => ({
      timestamp: item.timestamp,
      boxes: item.boxes.map((value) => ({ value }))
    }));

    return transformedData;
  } catch (error) {
    console.error('Fetch error:', error);
    return [];
  }
}

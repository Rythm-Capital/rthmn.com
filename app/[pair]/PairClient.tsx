"use client";
import React, { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { BoxSlice } from "@/types";
import HistogramManager from "../../components/Histogram/HistogramManager";
import { getBoxSlices } from "@/app/utils/getBoxSlices";
import PairsSidebar from "@/components/PairsSidebar";

interface OHLC {
	open: number;
	high: number;
	low: number;
	close: number;
}

interface PairData {
	boxes: BoxSlice[];
	currentOHLC: OHLC;
}

interface DashboardClientProps {
	initialData: BoxSlice[];
	pair: string;
	allPairsData: Record<string, PairData>;
}

const PairClient: React.FC<DashboardClientProps> = ({
	initialData,
	pair,
	allPairsData,
}) => {
	const [histogramHeight, setHistogramHeight] = useState(200);
	console.log("All pairs latest data:", allPairsData);

	const fetchData = useCallback(async () => {
		const newData = await getBoxSlices(pair, undefined, 250);
		console.log("New data fetched:", newData.length, "items");
		return newData;
	}, [pair]);

	const { data, isLoading, error, refetch } = useQuery<BoxSlice[]>({
		queryKey: ["boxSlices", pair],
		queryFn: fetchData,
		initialData: initialData,
		refetchInterval: 5000,
	});

	const handleHistogramResize = useCallback((newHeight: number) => {
		setHistogramHeight(newHeight);
	}, []);

	if (isLoading) return <div>Loading...</div>;
	if (error) return <div>Error: {(error as Error).message}</div>;
	if (!data) return <div>No data available</div>;

	return (
		<div className="flex">
			<PairsSidebar pairs={allPairsData} currentPair={pair} />
			<div className="flex-grow">
				<HistogramManager
					data={data}
					height={histogramHeight}
					onResize={handleHistogramResize}
				/>
			</div>
		</div>
	);
};

export default React.memo(PairClient);

import { useState, useRef } from "react";

export function usePullToRefresh(onRefresh) {
  const [refreshing, setRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const containerRef = useRef(null);

  const onTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = async (e) => {
    const diff = e.changedTouches[0].clientY - touchStartY.current;
    const scrollTop = containerRef.current?.scrollTop ?? 0;
    if (diff > 70 && scrollTop <= 0 && !refreshing) {
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    }
  };

  return { refreshing, containerRef, onTouchStart, onTouchEnd };
}

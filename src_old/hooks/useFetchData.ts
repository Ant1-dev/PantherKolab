// import { useEffect } from "react";
import useSWR from "swr";
import { useSWRConfig } from "swr";

export default function useFetchData<T>(
  userId: string,
  key: any,
  fetcher: (key: any) => any
) {
  const { data, error, isLoading } = useSWR(key, fetcher(userId), {
    // revalidateOnMount: true,
    revalidateOnFocus: false,
  });

  const { mutate } = useSWRConfig();

  return {
    data,
    isLoading,
    isError: error,
    revalidate: () => mutate(key),
  } as { data: T; isLoading: boolean; isError: boolean; revalidate: Function };
}

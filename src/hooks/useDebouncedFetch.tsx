import React from "react";
import axios from "axios";

interface ReducerState<T> {
  isLoading: boolean;
  errorMsg: string;
  data: T | null;
}

interface ReducerAction<T> {
  type: string;
  payload?: {
    data?: T;
    errorMsg?: string;
  };
}

interface UseAsyncFetchParams<P, R> {
  initialParams: P;
  fetchFunc: (params: P) => Promise<R>;
  validateFunc?: (params: P) => void;
}

interface UseDebouncedAsyncFetchParams<P, R> extends UseAsyncFetchParams<P, R> {
  wait: number;
}

export function dataFetchReducer<T>(
  state: ReducerState<T>,
  action: ReducerAction<T>
) {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        errorMsg: ""
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        errorMsg: "",
        data:
          action.payload && action.payload.data
            ? action.payload.data
            : state.data
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        errorMsg:
          action.payload && action.payload.errorMsg
            ? action.payload.errorMsg
            : "Something went wrong"
      };
    default:
      throw new Error();
  }
}

export function useDebouncedFetch<P, T>({
  initialParams,
  fetchFunc,
  validateFunc,
  wait
}: UseDebouncedAsyncFetchParams<P, T>) {
  const [params, setParams] = React.useState(initialParams);
  const [state, dispatch] = React.useReducer(
    dataFetchReducer as React.Reducer<ReducerState<T>, ReducerAction<T>>,
    {
      isLoading: false,
      errorMsg: "",
      data: null
    }
  );

  React.useEffect(() => {
    if (validateFunc) {
      try {
        validateFunc(params);
      } catch (err) {
        return dispatch({ type: "FETCH_FAILURE" });
      }
    }

    const timeout = setTimeout(() => {
      async function lazyFetch() {
        dispatch({ type: "FETCH_INIT" });
        try {
          const res = await fetchFunc(params);
          dispatch({ type: "FETCH_SUCCESS", payload: { data: res } });
        } catch (err) {
          if (!axios.isCancel(err)) {
            dispatch({ type: "FETCH_FAILURE" });
          }
        }
      }

      lazyFetch();
    }, wait);

    return () => {
      clearTimeout(timeout);
    };
  }, [params]);

  return { ...state, setParams };
}

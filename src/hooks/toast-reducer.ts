
import * as React from "react"
import { 
  actionTypes,
  type Action,
  type State,
  TOAST_LIMIT,
} from "./toast-types"

export function toastReducer(state: State, action: Action): State {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action

      if (toastId) {
        return {
          ...state,
          toasts: state.toasts.map((t) =>
            t.id === toastId
              ? {
                  ...t,
                  open: false,
                }
              : t
          ),
        }
      }

      return {
        ...state,
        toasts: state.toasts.map((t) => ({
          ...t,
          open: false,
        })),
      }
    }

    case actionTypes.REMOVE_TOAST:
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }

    default:
      return state
  }
}

export function createUseReducerWithDispatch<TState, TAction>(
  reducer: React.Reducer<TState, TAction>,
  initialState: TState,
) {
  const useReducerWithDispatch = (initializer?: (state: TState) => TState) => {
    const [state, dispatch] = React.useReducer(
      reducer,
      initialState,
      initializer as any,
    )

    const dispatchWithState = React.useCallback(
      (action: TAction) => {
        return dispatch(action)
      },
      [dispatch],
    )

    return [state, dispatchWithState] as const
  }

  return useReducerWithDispatch
}

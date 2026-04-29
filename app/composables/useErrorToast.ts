import { FetchError } from 'ofetch'

export function isFetchError(error: unknown): error is FetchError {
    return error instanceof FetchError
}

export function useErrorToast() {
    const toast = useToast()

    function errorMessage(error: unknown, fallback: string) {
        return isFetchError(error) && error.response && error.response._data
            ? error.response._data.data.message
            : fallback
    }

    function errorToast(opt: ErrorToastOpt) {
        const title = opt.title ?? 'Error'
        const fallback = opt.description ?? 'Something went wrong'
        const description = opt.error ? errorMessage(opt.error, fallback) : fallback
        if (!opt.skipToast) {
            toast.add({
                title,
                description,
                color: 'error',
            })
        }
        console.error(`${title}: `, description)
        return description
    }

    return {
        errorMessage,
        errorToast,
    }
}

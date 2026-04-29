export function useSuccessToast() {
    const toast = useToast()

    function successToast(opt: SuccessToastOpt) {
        const title = opt.title ?? 'Success'
        const description = opt.description ?? 'Action completed successfully'
        if (!opt.skipToast) {
            toast.add({
                title,
                description,
                color: 'success',
            })
        }
        return description
    }

    return {
        successToast,
    }
}

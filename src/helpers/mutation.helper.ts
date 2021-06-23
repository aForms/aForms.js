
export class MutationHelper {

    errorMutationObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            const { target } = mutation;
            if (mutation.attributeName === 'class') {
                // @ts-ignore
                const currentState = mutation.target.classList.contains('error');
                if (currentState) {
                    // @ts-ignore
                    mutation.target?.setAttribute?.('aria-invalid', 'true');
                    // @ts-ignore
                    mutation.target?.querySelectorAll('input')?.forEach(value => value.setAttribute?.('aria-invalid', 'true'))
                } else {
                    // @ts-ignore
                    mutation.target?.setAttribute?.('aria-invalid', 'false');
                    // @ts-ignore
                    mutation.target?.querySelectorAll('input')?.forEach(value => value.removeAttribute?.('aria-invalid', 'false'))
                }
            }
        });
    });

}

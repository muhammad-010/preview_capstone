export default defineAppConfig({
    ui: {
        colors: {
            primary: 'brand',
            secondary: 'purple',
        },
        main: {
            base: 'bg-primary-50! dark:bg-primary-950!',
        },
        button: {
            slots: {
                base: 'justify-center! cursor-pointer',
            },
            compoundVariants: [
                {
                    color: 'primary',
                    variant: 'solid',
                    class: 'text-inverted dark:text-primary-50',
                },
            ],
        },
        badge: {
            slots: {
                base: 'rounded-full!',
            },
        },
        dashboardNavbar: {
            slots: {
                root: 'h-fit bg-primary-900 dark:bg-primary-900 lg:border-none lg:bg-transparent lg:dark:bg-transparent',
                toggle: 'navbar-ghost-button', // app/assets/css/main.css
            },
        },
        dashboardSidebar: {
            slots: {
                root: 'bg-primary-900 text-primary-50 transition-all',
                content: 'bg-primary-900 text-primary-50',
                toggle: 'text-neutral-300! hover:bg-primary/50 dark:hover:bg-primary/25 cursor-pointer',
                header: 'border-b border-primary-100/25',
                body: 'border-none',
                footer: 'border-t border-primary-100/25',
            },
        },
        navigationMenu: {
            slots: {
                item: 'my-2',
                link: 'p-3!',
            },
            variants: {
                active: {
                    true: {
                        link: 'before:bg-primary! text-primary-50!',
                        linkLeadingIcon: 'text-primary-50!',
                    },
                    false: {
                        link: 'hover:before:bg-primary/50! dark:hover:before:bg-primary/25! text-primary-300! transition-colors',
                        linkLeadingIcon: 'text-primary-300!',
                    },
                },
            },
        },
        table: {
            slots: {
                root: 'rounded-md border border-neutral-500/25',
                thead: 'bg-primary-50 dark:bg-primary-950',
            },
        },
        breadcrumb: {
            slots: {
                separator: 'max-lg:text-primary-50 dark:lg:text-primary-50',
            },
            variants: {
                active: {
                    true: {
                        link: 'max-lg:text-primary-50 dark:lg:text-primary-50',
                    },
                    false: {
                        link: 'max-lg:text-primary-50/50!',
                    },
                },
            },
        },
        stepper: {
            variants: {
                color: {
                    primary: {
                        icon: 'dark:text-primary-50',
                    },
                },
            },
        },
        tabs: {
            slots: {
                trigger: 'cursor-pointer',
                label: 'dark:text-primary-50',
            },
        },
    },
})

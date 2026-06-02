import { Skeleton } from '@/components/ui/skeleton';

export function FooterSkeleton() {
    return (
        <footer className="border-t border-border mt-auto">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-1">
                        <Skeleton className="h-8 w-32 mb-4" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                    <div>
                        <Skeleton className="h-4 w-20 mb-4" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-28" />
                        </div>
                    </div>
                    <div>
                        <Skeleton className="h-4 w-20 mb-4" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-14" />
                            <Skeleton className="h-4 w-12" />
                        </div>
                    </div>
                    <div>
                        <Skeleton className="h-4 w-16 mb-4" />
                        <Skeleton className="h-4 w-40" />
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t border-border">
                    <Skeleton className="h-4 w-48" />
                </div>
            </div>
        </footer>
    );
}

import {NextResponse, connection} from 'next/server';

export async function GET() {
    await connection();
    const publishableKey =
        process.env.STRIPE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

    if (!publishableKey || !publishableKey.startsWith('pk_')) {
        return NextResponse.json(
            {publishableKey: null},
            {
                status: 200,
                headers: {'Cache-Control': 'no-store'},
            }
        );
    }

    return NextResponse.json(
        {publishableKey},
        {
            status: 200,
            headers: {'Cache-Control': 'no-store'},
        }
    );
}

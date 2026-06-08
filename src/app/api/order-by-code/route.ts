import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/vendure/api';
import { graphql } from '@/graphql';

const GetOrderByCodeQuery = graphql(`
    query GetOrderByCodeStatus($code: String!) {
        orderByCode(code: $code) {
            id
            code
            state
            totalWithTax
            currencyCode
        }
    }
`);

export async function GET(request: NextRequest) {
    const code = request.nextUrl.searchParams.get('code');
    if (!code) {
        return NextResponse.json({ error: 'Missing code' }, { status: 400 });
    }

    try {
        const { data } = await query(GetOrderByCodeQuery, { code });
        if (data?.orderByCode) {
            return NextResponse.json({ order: data.orderByCode });
        }
        return NextResponse.json({ order: null }, { status: 404 });
    } catch {
        return NextResponse.json({ order: null }, { status: 500 });
    }
}

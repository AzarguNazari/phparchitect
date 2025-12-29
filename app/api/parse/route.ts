import { NextRequest, NextResponse } from 'next/server';
import { PHPToUMLParser } from '@/lib/parser/php-parser';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const files = formData.getAll('files') as File[];

        if (!files || files.length === 0) {
            return NextResponse.json({ error: 'No files provided' }, { status: 400 });
        }

        const fileContents = await Promise.all(
            files.map(async (file) => {
                const text = await file.text();
                return text;
            })
        );

        const parser = new PHPToUMLParser();
        const uml = parser.parseFiles(fileContents);

        return NextResponse.json({ uml });
    } catch (error) {
        console.error('Error in parse API:', error);
        return NextResponse.json({ error: 'Failed to parse files' }, { status: 500 });
    }
}

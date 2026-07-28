import { translateTexts } from "@/lib/deepl";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const {
            texts,
            sourceLang,
            targetLang,
        } = await req.json();

        const translations =
            await translateTexts({
                texts,
                sourceLang,
                targetLang,
            });

        return NextResponse.json({
            success: true,
            translations,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: "Translation failed",
            },
            {
                status: 500,
            }
        );
    }
}
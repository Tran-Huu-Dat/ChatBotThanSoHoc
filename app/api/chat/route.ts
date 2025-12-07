import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { buildNumerologyProfile } from "../../../lib/numerology";

export const runtime = "nodejs";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  // Bạn nên set GEMINI_API_KEY trong .env.local
  throw new Error("Missing GEMINI_API_KEY in environment variables");
}

const ai = new GoogleGenAI({
  apiKey,
  // Bạn có thể chỉ định apiVersion nếu muốn:
  // apiVersion: "v1",
});

const MODEL_NAME = "gemini-2.5-flash";

type ClientMessage = {
  id: number;
  role: "user" | "bot";
  text: string;
};

// Prompt hệ thống: mô tả vai trò + format + cách xử lý hội thoại nhiều lượt
const systemPrompt = `
Bạn là CHUYÊN GIA THẦN SỐ HỌC (Numerology) trả lời bằng TIẾNG VIỆT.

PHONG CÁCH:
- Giải thích dễ hiểu cho người mới, giọng thân thiện nhưng rõ ràng.
- Không nói thần số học là “định mệnh tuyệt đối”, chỉ là xu hướng, tiềm năng, lời gợi ý.
- Không đưa lời khuyên y tế, tài chính, pháp lý. Nếu câu hỏi lệch quá xa, hãy kéo nhẹ về chủ đề thần số học.
- Thỉnh thoảng dùng emoji nhẹ nhàng (✨🌟🔮🌱) nhưng không lạm dụng.

BỐI CẢNH:
- Bạn đang ở trong một cuộc hội thoại nhiều lượt.
- Lịch sử chat và (có thể) hồ sơ thần số học đã tính sẵn sẽ được gửi ở dưới.
- LUÔN tận dụng thông tin đã có (ngày sinh, họ tên, các con số đã tính).
- KHÔNG hỏi lại ngày sinh/họ tên nếu đã xuất hiện rõ ràng trong lịch sử hoặc trong hồ sơ, trừ khi thật sự thiếu.

ĐỘ DÀI:
- Ưu tiên câu trả lời khoảng 200–300 từ cho mỗi lượt.
- Nếu là câu hỏi “follow-up” (ví dụ: “vậy làm sao cải thiện điểm yếu?”), hãy trả lời ngắn hơn, tập trung vào hành động cụ thể.

ĐỊNH DẠNG BẮT BUỘC (DÙNG MARKDOWN, CÓ DÒNG TRỐNG GIỮA CÁC MỤC):

[1] TÓM TẮT
- 1–3 câu nêu ý chính quan trọng nhất.

[2] THÔNG TIN ĐẦU VÀO
- Ngày sinh: ...
- Họ tên: ...
- Câu hỏi: ...

[3] CÁC CHỈ SỐ CHÍNH (nếu có)
- Số Đường Đời: ... → 1 câu ý chính.
- Số Sứ Mệnh / Tên: ... (nếu có).
- Các chỉ số khác (Ví dụ: Ngày sinh, Linh Hồn, Nhân Cách, Trưởng Thành… nếu được cung cấp).
- Không quá 4 gạch đầu dòng trong mục này.

[4] PHÂN TÍCH CHÍNH
- 2–3 gạch đầu dòng, mỗi gạch tối đa 1–2 câu.
- Tập trung vào: tính cách nổi bật, điểm mạnh, điểm cần cân bằng.

[5] GỢI Ý ỨNG DỤNG
- 3–5 gạch đầu dòng, là các hành động CỤ THỂ, thực tế, dễ làm, gắn với các con số của người dùng.

[6] LƯU Ý NHẸ
- 1–2 câu nhắc rằng thần số học chỉ là công cụ tham khảo, người dùng vẫn là người quyết định cuộc đời mình.

XỬ LÝ CÂU HỎI TIẾP THEO (FOLLOW-UP):
- Nếu câu hỏi mới liên quan đến phân tích đã có trước đó (vd: “vậy tôi cần làm gì để cải thiện điểm yếu của tôi?”):
  - KHÔNG phân tích lại từ đầu, không giới thiệu dài dòng.
  - Tập trung nhiều hơn vào mục [5] GỢI Ý ỨNG DỤNG và liên hệ trực tiếp các điểm yếu/điểm mạnh đã nói trước đó.
  - Có thể nhắc lại rất ngắn 1–2 chi tiết quan trọng nếu cần, nhưng không lặp nguyên bài cũ.

NẾU KHÔNG CÓ ĐỦ THÔNG TIN:
- Nếu không có ngày sinh/họ tên nhưng người dùng yêu cầu phân tích cá nhân, hãy giải thích chung, và nhẹ nhàng gợi ý họ cung cấp thêm thông tin trong phần [5] GỢI Ý ỨNG DỤNG.
`;

// Hàm build phần text từ hồ sơ thần số học (nếu có)
function buildProfileText(birthDate?: string, fullName?: string) {
  if (!birthDate || !fullName) return "";

  try {
    const profile = buildNumerologyProfile(birthDate, fullName);

    return `
HỒ SƠ THẦN SỐ HỌC ĐÃ TÍNH SẴN (KHÔNG CẦN TỰ TÍNH LẠI):

- Ngày sinh: ${profile.raw.birthDate}
- Họ tên: ${profile.raw.fullName}

- Số Đường Đời (Life Path): ${profile.core.lifePath.value}
- Số Ngày Sinh (Birthday): ${profile.core.birthdayNumber.value}
- Số Sứ Mệnh / Biểu Hiện (Destiny/Expression): ${
      profile.core.destiny?.value ?? "không tính được"
    }
- Số Linh Hồn (Soul Urge): ${profile.core.soulUrge?.value ?? "không tính được"}
- Số Nhân Cách (Personality): ${
      profile.core.personality?.value ?? "không tính được"
    }
- Số Trưởng Thành (Maturity): ${
      profile.core.maturity?.value ?? "không tính được"
    }

Hãy sử dụng các con số trên để phân tích, KHÔNG tự suy đoán lại con số khác.
`;
  } catch (err) {
    console.error("Lỗi khi build profile numerology:", err);
    return `
Không thể xây dựng hồ sơ thần số học từ dữ liệu birthDate/fullName cung cấp.
Hãy trả lời dựa trên lịch sử hội thoại và câu hỏi của người dùng.
`;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const messages = body.messages as ClientMessage[] | undefined;
    const birthDate = (body.birthDate as string | undefined)?.trim();
    const fullName = (body.fullName as string | undefined)?.trim();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Thiếu trường 'messages' trong body." },
        { status: 400 }
      );
    }

    // Convert lịch sử message thành text (role: user/bot)
    const historyText = messages
      .map((m) =>
        m.role === "user" ? `Người dùng: ${m.text}` : `Trợ lý: ${m.text}`
      )
      .join("\n\n");

    const profileText = buildProfileText(birthDate, fullName);

    const fullPrompt = `
${systemPrompt}

${profileText ? profileText : ""}

DƯỚI ĐÂY LÀ TOÀN BỘ LỊCH SỬ HỘI THOẠI (MỚI NHẤT Ở CUỐI):

${historyText}

Hãy trả lời cho CÂU HỎI CUỐI CÙNG của người dùng, tuân thủ đúng định dạng [1]..[6] đã mô tả ở trên.
`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        {
          role: "user",
          parts: [{ text: fullPrompt }],
        },
      ],
    });

    // SDK trả về field .text (theo tài liệu Google Gen AI SDK)
    const replyText =
      (response as any).text ??
      "Xin lỗi, hiện tại mình chưa trả lời được. Bạn thử lại sau nhé.";

    return NextResponse.json({ reply: replyText });
  } catch (err) {
    console.error("Gemini API error:", err);
    return NextResponse.json(
      { error: "Lỗi khi gọi Google AI (Gemini)." },
      { status: 500 }
    );
  }
}

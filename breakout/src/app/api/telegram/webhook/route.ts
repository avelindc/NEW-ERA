import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Force dynamic so Next.js doesn't cache this route
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const update = await req.json();

    // Check if it's a callback query (button click)
    if (update.callback_query) {
      const callbackQuery = update.callback_query;
      const data = callbackQuery.data; // e.g. "take_cuid" or "rej_cuid"
      const message = callbackQuery.message;

      if (!data) {
        // Check if it's a normal message (e.g., photo upload)
    if (update.message) {
      const message = update.message;
      if (message.photo && message.caption) {
        const caption = message.caption.trim().toLowerCase();
        if (caption === "/setbg" || caption === "/setbq") {
          const botTokenSetting = await prisma.settings.findUnique({ where: { key: "telegram_bot_token" } });
          const botToken = botTokenSetting?.value;
          
          if (botToken) {
            // Get the largest photo (last element in the array)
            const photo = message.photo[message.photo.length - 1];
            
            // Get file path from Telegram
            const fileRes = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${photo.file_id}`);
            const fileData = await fileRes.json();
            
            if (fileData.ok && fileData.result.file_path) {
              const fileUrl = `https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`;
              
              // Save to Prisma Settings
              await prisma.settings.upsert({
                where: { key: "auth_bg_image" },
                update: { value: fileUrl },
                create: { key: "auth_bg_image", value: fileUrl, description: "Background for Auth Pages" }
              });
              
              // Revalidate auth pages
              revalidatePath("/login");
              revalidatePath("/register");
              
              // Send success reply
              await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  chat_id: message.chat.id,
                  text: "✅ Background halaman Login & Register berhasil diupdate!",
                  reply_to_message_id: message.message_id
                })
              });
            }
          }
        }
      }
    }

    return NextResponse.json({ ok: true });
      }

      let releaseId = "";
      let newStatus = "";
      let statusText = "";

      if (data.startsWith("take_")) {
        releaseId = data.substring(5);
        newStatus = "APPROVED"; // Approved
        statusText = "✅ Disetujui (APPROVED)";
      } else if (data.startsWith("rej_")) {
        releaseId = data.substring(4);
        newStatus = "REJECTED"; // Rejected
        statusText = "❌ Ditolak (REJECTED)";
      }

      if (newStatus && releaseId) {
        // Get bot token from settings to send replies
        const tokenSetting = await prisma.settings.findUnique({
          where: { key: 'telegram_bot_token' }
        });
        const botToken = tokenSetting?.value;

        // Update release status in DB
        await prisma.release.update({
          where: { id: releaseId },
          data: { status: newStatus as any }
        });

        // Revalidate the entire application layout to clear client router cache
        revalidatePath("/", "layout");

        if (botToken) {
          // 1. Answer the callback query to stop the loading spinner on the button
          await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              callback_query_id: callbackQuery.id,
              text: `Status Release diperbarui: ${newStatus}`,
              show_alert: false
            })
          });

          // 2. Edit the original message to remove the buttons and show who took it
          const newCaption = `${message.caption || ''}\n\n*Status:* ${statusText} oleh ${callbackQuery.from.first_name || 'Admin'}`;
          
          await fetch(`https://api.telegram.org/bot${botToken}/editMessageCaption`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: message.chat.id,
              message_id: message.message_id,
              caption: newCaption,
              parse_mode: "Markdown",
              reply_markup: { inline_keyboard: [] } // Remove buttons
            })
          });
        }
      }
    }

    // Check if it's a normal message (e.g., photo upload)
    if (update.message) {
      const message = update.message;
      if (message.photo && message.caption) {
        const caption = message.caption.trim().toLowerCase();
        if (caption === "/setbg" || caption === "/setbq") {
          const botTokenSetting = await prisma.settings.findUnique({ where: { key: "telegram_bot_token" } });
          const botToken = botTokenSetting?.value;
          
          if (botToken) {
            // Get the largest photo (last element in the array)
            const photo = message.photo[message.photo.length - 1];
            
            // Get file path from Telegram
            const fileRes = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${photo.file_id}`);
            const fileData = await fileRes.json();
            
            if (fileData.ok && fileData.result.file_path) {
              const fileUrl = `https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`;
              
              // Save to Prisma Settings
              await prisma.settings.upsert({
                where: { key: "auth_bg_image" },
                update: { value: fileUrl },
                create: { key: "auth_bg_image", value: fileUrl, description: "Background for Auth Pages" }
              });
              
              // Revalidate auth pages
              revalidatePath("/login");
              revalidatePath("/register");
              
              // Send success reply
              await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  chat_id: message.chat.id,
                  text: "✅ Background halaman Login & Register berhasil diupdate!",
                  reply_to_message_id: message.message_id
                })
              });
            }
          }
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram Webhook Error:", error);
    // Always return 200 to Telegram so they don't retry unnecessarily
    return NextResponse.json({ ok: true, error: "Internal Server Error" });
  }
}

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3 from "../utils/helpers/aws-s3";
import { z } from "zod";
import { Request, Response } from "express";

export const getPutObjectSignedUrlValidation = z.object({
    files: z.array(
        z.object({
            filekey: z.string({ required_error: "FileKey is required" }).min(1),
            fileSize: z.string().optional(),
            contentType: z.string({ required_error: "ContentType is required" }).min(1),
        })
    )
});

export async function getPutObjectSignedUrls(req: Request, res: Response): Promise<Response> {
    try {
        const parsedReqBody = getPutObjectSignedUrlValidation.parse(req.body);
        const { files } = parsedReqBody;
        const urls:string[] = await Promise.all(files.map(async (file) => {
            const command = new PutObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME as string,
                Key: `upload/${file.filekey}`,
                ContentType: file.contentType
            });
            return await getSignedUrl(s3, command);
        }));
        return res.status(200).json({data:urls});
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.issues[0].message });
        }
        console.error("Error generating pre-signed URLs:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
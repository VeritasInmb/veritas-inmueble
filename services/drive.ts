import { google } from 'googleapis';
import { Readable } from 'stream';

let auth;
let drive: any;

try {
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        auth = new google.auth.GoogleAuth({
            keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
            scopes: ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive'],
        });
        drive = google.drive({ version: 'v3', auth });
    }
} catch (e) {
    console.warn("Failed to initialize Google Drive client:", e);
}

const MAIN_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

export async function uploadFileToDrive(base64Data: string, mimeType: string, filename: string, agencyName: string) {
    if (!drive || !MAIN_FOLDER_ID) {
        console.warn("Google Drive API is not configured or MAIN_FOLDER_ID is missing.");
        return "mock_drive_file_id";
    }

    try {
        // 1. Find or create the agency folder
        const folderName = agencyName.trim() || 'Desconocida';
        let agencyFolderId = await findFolder(folderName, MAIN_FOLDER_ID);
        
        if (!agencyFolderId) {
            agencyFolderId = await createFolder(folderName, MAIN_FOLDER_ID);
        }

        if (!agencyFolderId) throw new Error("Failed to create or find agency folder");

        // 2. Upload file
        const buffer = Buffer.from(base64Data, 'base64');
        const stream = Readable.from(buffer);

        const response = await drive.files.create({
            requestBody: {
                name: filename,
                parents: [agencyFolderId],
            },
            media: {
                mimeType,
                body: stream,
            },
            fields: 'id',
        });

        return response.data.id;
    } catch (error) {
        console.error("Drive upload error:", error);
        throw error;
    }
}

async function findFolder(name: string, parentId: string) {
    const response = await drive.files.list({
        q: `mimeType='application/vnd.google-apps.folder' and name='${name}' and '${parentId}' in parents and trashed=false`,
        fields: 'files(id, name)',
        spaces: 'drive',
    });
    return response.data.files && response.data.files.length > 0 ? response.data.files[0].id : null;
}

async function createFolder(name: string, parentId: string) {
    const fileMetadata = {
        name: name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentId],
    };
    const response = await drive.files.create({
        requestBody: fileMetadata,
        fields: 'id',
    });
    return response.data.id;
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Base64 helper supporting Unicode characters safely in the browser
const encodeBase64UrlSafe = (str: string): string => {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

/**
 * Service to backup card credentials & transactions record directly into Google Drive as a text document
 */
export const backupToGoogleDrive = async (accessToken: string, clientName: string, cardNum: string, cardAmount: number, filledCount: number, balance: number, txsCount: number): Promise<any> => {
  const filename = `MOBIKISSI-Backup-${cardNum}-${Date.now().toString().slice(-4)}.txt`;
  
  const content = `===========================================
               MOBIKISSI SAVING BACKUP
===========================================
Client(e) : ${clientName}
Date de Backup : ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR')}
-------------------------------------------
CARTE DE POINTAGE :
- Numéro : ${cardNum}
- Montant par pointage : ${cardAmount.toLocaleString()} FCFA
- Progression : ${filledCount} / 30 Cases (${Math.round((filledCount / 30) * 100)}%)
- Épargne cumulée sur carte : ${(filledCount * cardAmount).toLocaleString()} FCFA

COMPTE GLOBAL MOBIKISSI :
- Solde d'Épargne Total : ${balance.toLocaleString()} FCFA
- Nombre d'Opérations Enregistrées : ${txsCount}

-------------------------------------------
Propulsé par TO SOLOLA Group.
"Épargner, Grandir, Réussir."
===========================================`;

  // 1. Create blank file in Google Drive with metadata
  const metadata = {
    name: filename,
    mimeType: 'text/plain'
  };

  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(metadata)
  });

  if (!createRes.ok) {
    const errorBody = await createRes.text();
    throw new Error(`Google Drive Create Meta failed: ${createRes.status} - ${errorBody}`);
  }

  const fileData = await createRes.json();
  const fileId = fileData.id;

  // 2. Upload text content using custom PATCH with media uploadType
  const uploadRes = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'text/plain'
    },
    body: content
  });

  if (!uploadRes.ok) {
    const errorBody = await uploadRes.text();
    throw new Error(`Google Drive Media Upload failed: ${uploadRes.status} - ${errorBody}`);
  }

  return fileData;
};

/**
 * Service to generate a custom Google Doc with financial literacy commitments and goals
 */
export const createFinancialCommitmentDoc = async (accessToken: string, clientName: string, referralCode: string, earnedBadges: string[]): Promise<any> => {
  const docTitle = `Angagement Entrepreneurial - ${clientName}`;
  
  // 1. Create a blank Google Document
  const docMetadata = {
    title: docTitle
  };

  const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(docMetadata)
  });

  if (!createRes.ok) {
    const errorBody = await createRes.text();
    throw new Error(`Google Docs Create failed: ${createRes.status} - ${errorBody}`);
  }

  const docData = await createRes.json();
  const documentId = docData.documentId;

  // 2. Write formatted contents into the newly provisioned document
  const docBody = `CONTRAT D'ENGAGEMENT ENTREPRENEURIAL
MOBIKISSI / TO SOLOLA Group

Discipline, Épargne, Croissance et Autonomie Financière.

Je soussigné(e), ${clientName}, m'engage solennellement devant MOBIKISSI à maintenir une saine discipline financière, basée sur des pointages réguliers et une saine gestion budgétaire.

Mon code parrainage actif : ${referralCode || 'Aucun'}
Nombre de distinctions obtenues : ${earnedBadges.length} insignes de mérite.

COMPTABILITÉ ET VALEURS CLÉS :
1. Pratiquer le versement régulier d'épargne d'au moins 500 FCFA.
2. Séparer rigoureusement mes fonds professionnels de mes dépenses personnelles.
3. Se former régulièrement grâce à la section d'alphabétisation financière.
4. Partager la discipline avec mon réseau d'affaires.

Signé le : ${new Date().toLocaleDateString('fr-FR')}
Par : ${clientName} (Entrepreneur(e) MOBIKISSI)`;

  const batchUpdateRes = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: [
        {
          insertText: {
            text: docBody,
            location: {
              index: 1
            }
          }
        }
      ]
    })
  });

  if (!batchUpdateRes.ok) {
    const errorBody = await batchUpdateRes.text();
    throw new Error(`Google Docs update failed: ${batchUpdateRes.status} - ${errorBody}`);
  }

  return docData;
};

/**
 * Service to dispatch a custom saving summary via Gmail API directly to client recipient address
 */
export const sendGmailSummary = async (accessToken: string, recipientEmail: string, clientName: string, cardNum: string, progressText: string, balance: number, streak: number): Promise<any> => {
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; color: #1e293b;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #ea580c; margin: 0; font-size: 24px;">MOBIKISSI CG</h2>
        <p style="color: #64748b; font-size: 14px; margin: 4px 0 0 0;">Épargner, Grandir, Réussir.</p>
      </div>
      
      <p style="font-size: 15px;">Challereux bonjour <strong>${clientName}</strong>,</p>
      
      <p style="font-size: 14px; line-height: 1.6;">Voici votre rapport d'activité financière et votre progression d'épargne sur la plateforme numérique MOBIKISSI :</p>
      
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Compte Épargne Global</td>
            <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #0f172a;">${balance.toLocaleString()} FCFA</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Carte Active</td>
            <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #0f172a;">${cardNum}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Avancement par cases</td>
            <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #10b981;">${progressText}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Série active de pointages</td>
            <td style="padding: 6px 0; text-align: right; color: #ea580c; font-weight: bold;">🔥 ${streak} Jours</td>
          </tr>
        </table>
      </div>
      
      <p style="font-size: 13px; color: #64748b; line-height: 1.6; text-align: center; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
        Brazzaville, Quartier Massina PK, République du Congo.<br/>
        Propulsé par TO SOLOLA Group.
      </p>
    </div>
  `;

  // Construct standard Mimed Message
  const mailMessage = [
    `To: ${recipientEmail}`,
    `Subject: Rapport d'Epargne Hebdomadaire MOBIKISSI`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '',
    emailHtml
  ].join('\r\n');

  const rawEncoded = encodeBase64UrlSafe(mailMessage);

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      raw: rawEncoded
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gmail API failed: ${res.status} - ${errText}`);
  }

  return await res.json();
};

import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createUser, updateUser } from '@/lib/users';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) throw new Error('Add CLERK_WEBHOOK_SECRET to .env');

  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse('No svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return new NextResponse('Error verifying webhook', { status: 400 });
  }

  const data = evt.data as any;
  if (evt.type === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = data;
    if (!id || !email_addresses) return new NextResponse('Missing data', { status: 400 });
    await createUser({
      uid: id,
      email: email_addresses[0].email_address,
      displayName: `${first_name} ${last_name}`,
      photoURL: image_url,
    });
  }

  if (evt.type === 'user.updated') {
    const { id, first_name, last_name, image_url } = data;
    if (!id) return new NextResponse('Missing data', { status: 400 });
    await updateUser(id, { displayName: `${first_name} ${last_name}`, photoURL: image_url });
  }

  return new NextResponse('', { status: 200 });
}
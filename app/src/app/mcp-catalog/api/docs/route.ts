import { NextResponse } from 'next/server';

import openApiSpec from './openapi.json';

export async function GET() {
  return NextResponse.json(openApiSpec);
}

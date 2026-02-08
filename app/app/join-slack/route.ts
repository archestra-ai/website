import { redirect } from 'next/navigation';
import constants from '@constants';

export async function GET() {
  redirect(constants.slack.joinCommunityUrl);
}

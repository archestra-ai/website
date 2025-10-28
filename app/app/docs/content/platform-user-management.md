---
title: User Accounts
category: Archestra Platform
subcategory: User management
order: 5
description: Managing user accounts and authentication in Archestra Platform
lastUpdated: 2025-10-14
---

## Overview

Archestra Platform provides secure user account management with email and password authentication. Each user account is automatically assigned a personal organization for managing AI agents and configurations.

This guide covers:

- Creating and managing user accounts
- Sign in and sign out
- Session management
- Account security

## Creating Your Account

### Sign Up

When you first access Archestra Platform, you can create an account:

1. Navigate to [https://archestra.ai](https://archestra.ai)
2. Click **Sign Up**
3. Enter your email address
4. Choose a strong password
5. Complete the registration process

Upon successful registration:
- A personal organization is automatically created for you
- You're automatically signed in and ready to use the platform
- You can start creating and managing AI agents immediately

### Sign In

To access your account:

1. Navigate to [https://archestra.ai](https://archestra.ai)
2. Click **Sign In**
3. Enter your email and password
4. You'll be redirected to your dashboard

Your session persists across browser sessions until you sign out or the session expires.

### Sign Out

To end your session:

1. Click your profile avatar in the top right
2. Select **Sign Out**

## Your Organization

### What is an Organization?

Your organization is your workspace where you can:
- Create and manage AI agents
- Configure security policies
- Invite team members to collaborate
- View interactions history
- View tools detected
- Manage API keys and credentials

Each user account automatically gets a default organization named `{Your Name}'s Organization`.

> **Note:** The open-source version of Archestra currently supports one organization per user, with the ability to invite team members to your default organization. Advanced multi-tenant features are planned for future releases.

## Session Management

### Session Duration

- Sessions expire after a default period (7 days). The platform may automatically renew a session's expiration when the session is used and a configured refresh window has passed — this keeps you signed in while you're actively using the product.
- If you're inactive for a prolonged period, your session will expire and you'll need to sign in again.

### Session refresh and freshness

- For added security, some sensitive actions (for example: changing your password or certain account settings) may require a "fresh" session — in that case the platform may ask you to re-enter your password or sign in again.
- The exact timing for automatic session refresh and the definition of a "fresh" session are configurable by the platform; the defaults are designed to balance convenience and security.

### Active Sessions

Your account can have multiple active sessions across different:
- Browsers
- Devices
- Locations

### Managing sessions (sign out and revoke)

- Signing out of a device ends that device's session.
- You can view and revoke active sessions from your account settings to sign out other devices if you suspect unauthorized access or want to clean up old sessions.
- Changing your password may optionally revoke other sessions depending on the chosen settings.

### Security Best Practices

1. **Sign out** when using shared or public computers
2. **Use strong passwords** with a mix of characters, numbers, and symbols
3. **Don't share credentials** with others
4. **Keep your email secure** as it's used for account recovery
5. **Review session activity** regularly

## Collaborating with Team Members

You can invite team members to collaborate in your organization. Invited members can help create and manage agents, configure tools, and access your organization's resources.

### Inviting a Team Member

To invite someone to your organization:

1. Navigate to **Account → Settings**
2. Find the **Invite Member by Link** section
3. Enter the team member's email address
4. Select their role (**Admin** or **Member**)
5. Click **Generate Invitation Link**
6. Share the link with them via email or messaging

**Invitation details:**
- Links are unique and tied to the invited email address
- The invitee must use the invited email to sign up or sign in
- Links may expire after a period of time

### Accepting an Invitation

When you receive an invitation link:

**If you have an account:**
1. Click the invitation link
2. Sign in with your account
3. Review the invitation details (organization name, role, who invited you)
4. Click **Accept** to join

**If you're new to Archestra:**
1. Click the invitation link
2. You'll be directed to create an account
3. Sign up using the invited email address
4. The invitation is automatically accepted
5. You'll join the organization immediately

### Managing Team Members

Organization owners can manage team members:

1. Navigate to **Account → Members**
2. View all members and their roles
3. Update member roles or remove members as needed

**Member roles:**
- **Owner**: Full control of the organization
- **Admin**: Can manage members and agents
- **Member**: Can use and modify agents

For detailed information about team collaboration, see [Team Invitations](/docs/platform-team-invitations).

## Troubleshooting

### Cannot Sign In

**Problem:** Sign in fails with "Invalid credentials" error.

**Solutions:**
- Double-check your email and password for typos
- Ensure Caps Lock is not enabled
- Try resetting your password if you've forgotten it
- Clear browser cache and cookies, then try again

### Session Expired

**Problem:** You're unexpectedly signed out.

**Solutions:**
- This is normal after prolonged inactivity
- Simply sign in again to create a new session
- Your data and agents are preserved

### Cannot Access Dashboard

**Problem:** After signing in, you see an error or blank page.

**Solutions:**
- Refresh the page
- Clear browser cache
- Try a different browser
- Check your internet connection

## Best Practices

### Account Security

1. **Use a strong, unique password**: Don't reuse passwords from other services
2. **Keep your email secure**: Your email is tied to your account
3. **Sign out on shared devices**: Always sign out when using public computers
4. **Monitor your activity**: Review your agent and API usage regularly

### Organization Management

1. **Use descriptive names**: Name your agents and configurations clearly
2. **Regular cleanup**: Remove unused agents and API keys
3. **Backup configurations**: Export important agent configurations
4. **Monitor usage**: Keep track of API calls and costs

## API Access

For programmatic user management, Archestra Platform provides APIs for authentication and session management.

See the [Platform Developer Quickstart](/docs/platform-developer-quickstart) for API details.

## Next Steps

- **Team Collaboration**: Learn about [Team Invitations](/docs/platform-team-invitations) (Enterprise feature)
- **Configure Agents**: Learn about [Dynamic Tools](/docs/platform-dynamic-tools)
- **Set up Security**: Understand [The Lethal Trifecta](/docs/platform-lethal-trifecta)
- **Deploy to Production**: Follow the [Deployment Guide](/docs/platform-deployment)
- **Get Support**: Join our [Slack community](https://join.slack.com/t/archestracommunity/shared_invite/zt-39yk4skox-zBF1NoJ9u4t59OU8XxQChg)
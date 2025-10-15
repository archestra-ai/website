---
title: Team Invitations
category: Archestra Platform
subcategory: User management
order: 6
description: Inviting team members and managing organization access (Enterprise feature)
lastUpdated: 2025-10-14
---

## Overview

Team invitations allow you to collaborate with colleagues by giving them access to your organization. Members can have different roles with varying levels of permissions.

The current open-source version supports inviting team members to your default organization. Each invited member gets access to the organization's agents, tools, and configurations based on their assigned role.

> **Note:** Advanced multi-tenant features (multiple organizations per user, organization switching) are planned for future enterprise releases.

This guide covers:

- Inviting team members
- Managing invitations
- Understanding roles and permissions
- Team collaboration workflows

## Organization Roles

Archestra Platform supports multiple roles with different permissions:

| Role | Permissions |
|------|-------------|
| **Owner** | Full control: manage members, settings, agents, and delete organization |
| **Admin** | Manage members, agents, and settings (cannot delete organization) |
| **Member** | View and use agents, limited modification rights |

## Inviting Team Members

### Invite by Email Link

To invite someone to your organization:

1. Navigate to **Account → Settings**
2. Find the **Invite Member by Link** section
3. Enter the email address of the person you want to invite
4. Select their role (**Admin** or **Member**)
5. Click **Generate Invitation Link**
6. Share the generated link with the invitee via email or messaging

**Important notes:**
- Invitation links are unique and tied to a specific email address
- Links expire after a certain period (default: 7 days)
- The invitee must sign up or sign in with the invited email address
- You can create multiple invitations for different users

### Invitation Link Format

Invitation links look like:
```
https://archestra.ai/accept-invitation/inv_xxxxxxxxxx
```

### Accepting an Invitation

When someone invites you to their organization:

**If you already have an account:**
1. Click the invitation link
2. Sign in with your existing account
3. Review the invitation details:
   - Organization name
   - Your assigned role
   - Who invited you
4. Click **Accept** to join the organization
5. You'll be redirected to the organization dashboard

**If you don't have an account:**
1. Click the invitation link
2. You'll be redirected to the sign-up page
3. Create an account using the invited email address
4. The invitation will be automatically accepted
5. You'll be added to the organization with the assigned role

### Rejecting an Invitation

If you receive an invitation but don't want to join:

1. Click the invitation link
2. Sign in (if needed)
3. Review the invitation details
4. Click **Reject** on the invitation page

The invitation will be marked as rejected and the inviter will be notified.

## Managing Pending Invitations

Organization owners and admins can view and manage pending invitations:

1. Navigate to **Account → Settings**
2. Scroll to the **Pending Invitations** section
3. View all active, expired, and accepted invitations

### Invitation Actions

For each pending invitation, you can:

**Copy Link**: Get the invitation URL to share again
```
Click the copy icon next to any invitation
```

**Cancel**: Revoke the invitation (prevents it from being accepted)
```
Click the cancel button to invalidate the link
```

**Resend**: Create a fresh invitation for expired ones
```
Generate a new invitation for the same email address
```

### Invitation States

Invitations can have the following states:

- **Active**: Can still be accepted (not expired)
- **Expired**: Past expiration date, needs to be recreated
- **Accepted**: User has joined the organization
- **Rejected**: User declined the invitation
- **Cancelled**: Revoked by the inviter

## Managing Organization Members

### Viewing Members

To see all members of your organization:

1. Navigate to **Account → Members**
2. View the list of all members with their roles

Member information includes:
- Name and email
- Role in the organization
- Join date
- Last active timestamp

### Changing Member Roles

**Requirements:** You must be an **Owner** or **Admin** to change roles.

To update a member's role:

1. Navigate to the members list
2. Find the member you want to update
3. Click the role dropdown next to their name
4. Select the new role (**Owner**, **Admin**, or **Member**)
5. Confirm the change

**Important:**
- You cannot change your own role
- Organizations must have at least one owner
- Role changes take effect immediately
- The member will be notified of the role change

### Removing Members

**Requirements:** You must be an **Owner** or **Admin** to remove members.

To remove a member from the organization:

1. Navigate to the members list
2. Find the member you want to remove
3. Click the **Remove** button or three-dot menu
4. Confirm the removal

**What happens when a member is removed:**
- They immediately lose access to the organization
- Their active session is invalidated if this was their active organization
- They can still be re-invited later
- Their actions and history remain in the organization for audit purposes

### Leaving an Organization

To leave an organization you're a member of:

1. Navigate to **Account → Settings**
2. Click **Leave Organization**
3. Confirm your decision

**Important:**
- Owners cannot leave their own organization
- You'll lose access to all agents and data in that organization
- You'll be returned to your personal organization

## Multi-Organization Workflow (Future Feature)

> **Coming Soon:** The ability to belong to multiple organizations and switch between them is planned for future releases.

### Organization Switching

In future releases, when you belong to multiple organizations:

1. Click your profile or the organization dropdown in the top navigation
2. Select the organization you want to switch to
3. The page refreshes with the new organization context

### Organization Isolation

Each organization will be completely isolated:
- **Agents**: Each organization has its own agents and configurations
- **Data**: Interaction logs and history are separate
- **Members**: Different member lists and permissions
- **Settings**: Independent security policies and API keys

## Troubleshooting

### Cannot Accept Invitation

**Problem:** Clicking invitation link shows an error.

**Solutions:**
- Verify the invitation hasn't expired
- Ensure you're using the email address the invitation was sent to
- Try signing out and clicking the link again
- Contact the person who invited you for a fresh link

### Not Seeing Organization Members

**Problem:** Members list is empty or incomplete.

**Solutions:**
- Verify you have **Admin** or **Owner** role
- Refresh the page
- Check that you're viewing the correct active organization
- Contact your organization owner if the issue persists

### Cannot Remove a Member

**Problem:** Remove button is disabled or action fails.

**Solutions:**
- Verify you have **Admin** or **Owner** role
- You cannot remove yourself
- Organizations must keep at least one owner
- The member might be the sole owner

### Lost Access to Organization

**Problem:** You can't see an organization you previously belonged to.

**Possible reasons:**
- You were removed by an admin/owner
- You left the organization
- The organization was deleted
- Contact the organization owner for reinvitation

### Invitation Email Not Received

**Problem:** Invitee didn't receive the invitation link.

**Solutions:**
- The platform doesn't send emails automatically - you must share the link manually
- Copy the invitation link and send it via your preferred method
- Check that the email address is correct in the invitation
- Generate a new invitation if the link expired

## Best Practices

### For Organization Owners

1. **Assign roles appropriately**: Give members only the permissions they need
2. **Review members regularly**: Remove inactive or former team members
3. **Monitor invitations**: Cancel unused or expired invitations
4. **Have multiple owners**: Prevents lockout if one owner leaves
5. **Document access policies**: Maintain clear guidelines for who should have which roles

### For Team Members

1. **Accept invitations promptly**: Links may expire
2. **Verify organization context**: Check active org before making changes
3. **Communicate role changes**: If you need different permissions, ask admins
4. **Sign out properly**: Especially on shared devices
5. **Report access issues**: Contact your organization admin immediately

### For Teams

1. **Establish naming conventions**: For agents and configurations
2. **Document access policies**: Who should have which roles and why
3. **Regular access reviews**: Audit members quarterly
4. **Onboarding process**: Help new members understand organization structure
5. **Offboarding checklist**: Remove access when team members leave
6. **Use descriptive agent names**: Make it clear what each agent does
7. **Set up approval workflows**: For sensitive operations or production agents

## API Access

For programmatic team management, Archestra Platform provides APIs for:

- Listing organization members
- Creating invitations
- Managing roles
- Checking invitation status
- Removing members

See the [Platform Developer Quickstart](/docs/platform-developer-quickstart) for API details.

## Next Steps

- **Learn about User Accounts**: See [User Accounts](/docs/platform-user-management)
- **Configure Agents**: Learn about [Dynamic Tools](/docs/platform-dynamic-tools)
- **Set up Security**: Understand [The Lethal Trifecta](/docs/platform-lethal-trifecta)
- **Deploy to Production**: Follow the [Deployment Guide](/docs/platform-deployment)
- **Get Support**: Join our [Slack community](https://join.slack.com/t/archestracommunity/shared_invite/zt-39yk4skox-zBF1NoJ9u4t59OU8XxQChg)

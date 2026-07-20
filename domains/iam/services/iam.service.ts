import { PermissionNode, ManagedBundle, PermissionMetadata, Scope } from '../types/iam.types';

export interface IAMEditorSnapshot {
  scope: Scope;
  hierarchy: PermissionNode[];
  managedBundles: ManagedBundle[];
  customPolicies: ManagedBundle[];
  metadata: Record<string, PermissionMetadata>;
}

// ─── Per-scope mock data ──────────────────────────────────────────────────────

const PLATFORM_SNAPSHOT: IAMEditorSnapshot = {
  scope: 'PLATFORM',
  hierarchy: [
    {
      id: 'platform',
      name: 'Platform',
      children: [
        {
          id: 'platform.analytics',
          name: 'Analytics',
          children: [
            { id: 'platform.analytics.view', name: 'View Analytics' },
            { id: 'platform.analytics.export', name: 'Export Reports' },
          ],
        },
        {
          id: 'platform.billing',
          name: 'Billing',
          children: [
            { id: 'platform.billing.view', name: 'View Billing' },
            { id: 'platform.billing.manage', name: 'Manage Billing' },
          ],
        },
        {
          id: 'platform.iam',
          name: 'IAM',
          children: [
            { id: 'platform.iam.roles.view', name: 'View Roles' },
            { id: 'platform.iam.roles.manage', name: 'Manage Roles' },
            { id: 'platform.iam.permissions.manage', name: 'Manage Permissions' },
          ],
        },
        {
          id: 'platform.channels',
          name: 'Channels',
          children: [
            { id: 'platform.channels.view', name: 'View Channels' },
            { id: 'platform.channels.manage', name: 'Manage Channels' },
            { id: 'platform.channels.delete', name: 'Delete Channels' },
          ],
        },
        {
          id: 'platform.system',
          name: 'System',
          children: [
            { id: 'platform.system.settings', name: 'System Settings' },
            { id: 'platform.system.monitoring', name: 'Monitoring & Logs' },
          ],
        },
      ],
    },
  ],
  managedBundles: [
    {
      id: 'managed-platform-admin',
      name: 'Platform Administrator',
      description: 'Full platform administration access. Includes IAM, billing, and all channel management.',
      permissions: ['platform.iam.roles.manage', 'platform.iam.permissions.manage', 'platform.channels.manage', 'platform.billing.manage', 'platform.analytics.view', 'platform.system.settings'],
      isManaged: true,
    },
    {
      id: 'managed-platform-auditor',
      name: 'Platform Auditor',
      description: 'Read-only access to all platform resources for audit and compliance purposes.',
      permissions: ['platform.analytics.view', 'platform.billing.view', 'platform.channels.view', 'platform.iam.roles.view'],
      isManaged: true,
    },
    {
      id: 'managed-platform-channel-manager',
      name: 'Channel Manager',
      description: 'Can create, update, and manage channels. Cannot delete or access billing.',
      permissions: ['platform.channels.view', 'platform.channels.manage', 'platform.analytics.view'],
      isManaged: true,
    },
  ],
  customPolicies: [
    {
      id: 'custom-platform-1',
      name: 'Analytics Team',
      description: 'Custom policy for the internal analytics team.',
      permissions: ['platform.analytics.view', 'platform.analytics.export'],
      isManaged: false,
    },
  ],
  metadata: {
    'platform.channels.delete': {
      scope: 'PLATFORM',
      riskLevel: 'CRITICAL',
      description: 'Allows permanently deleting entire channels and all their content. Irreversible.',
      dependencies: ['platform.channels.view', 'platform.channels.manage'],
    },
    'platform.channels.manage': {
      scope: 'PLATFORM',
      riskLevel: 'HIGH',
      description: 'Allows creating and editing channels, including settings and membership.',
      dependencies: ['platform.channels.view'],
    },
    'platform.billing.manage': {
      scope: 'PLATFORM',
      riskLevel: 'CRITICAL',
      description: 'Allows modifying billing plans, payment methods, and subscription settings.',
      dependencies: ['platform.billing.view'],
    },
    'platform.iam.permissions.manage': {
      scope: 'PLATFORM',
      riskLevel: 'CRITICAL',
      description: 'Allows creating, modifying, and deleting permissions. Full access to the IAM system.',
      dependencies: ['platform.iam.roles.view', 'platform.iam.roles.manage'],
    },
  },
};

const CHANNEL_SNAPSHOT: IAMEditorSnapshot = {
  scope: 'CHANNEL',
  hierarchy: [
    {
      id: 'channel',
      name: 'Channel',
      children: [
        {
          id: 'channel.content',
          name: 'Content',
          children: [
            { id: 'channel.content.view', name: 'View Content' },
            { id: 'channel.content.create', name: 'Create Content' },
            { id: 'channel.content.publish', name: 'Publish Content' },
            { id: 'channel.content.delete', name: 'Delete Content' },
          ],
        },
        {
          id: 'channel.assessments',
          name: 'Assessments',
          children: [
            { id: 'channel.assessments.view', name: 'View Assessments' },
            { id: 'channel.assessments.manage', name: 'Manage Assessments' },
          ],
        },
        {
          id: 'channel.members',
          name: 'Members',
          children: [
            { id: 'channel.members.view', name: 'View Members' },
            { id: 'channel.members.invite', name: 'Invite Members' },
            { id: 'channel.members.remove', name: 'Remove Members' },
          ],
        },
        {
          id: 'channel.settings',
          name: 'Settings',
          children: [
            { id: 'channel.settings.view', name: 'View Settings' },
            { id: 'channel.settings.manage', name: 'Manage Settings' },
          ],
        },
      ],
    },
  ],
  managedBundles: [
    {
      id: 'managed-channel-admin',
      name: 'Channel Administrator',
      description: 'Full control over this channel including settings, content, and members.',
      permissions: ['channel.content.view', 'channel.content.create', 'channel.content.publish', 'channel.content.delete', 'channel.assessments.manage', 'channel.members.view', 'channel.members.invite', 'channel.members.remove', 'channel.settings.manage'],
      isManaged: true,
    },
    {
      id: 'managed-content-creator',
      name: 'Content Creator',
      description: 'Can create and edit content. Cannot manage members or channel settings.',
      permissions: ['channel.content.view', 'channel.content.create', 'channel.assessments.view'],
      isManaged: true,
    },
    {
      id: 'managed-reviewer',
      name: 'Reviewer',
      description: 'Can review and publish content created by others. Read-only otherwise.',
      permissions: ['channel.content.view', 'channel.content.publish', 'channel.assessments.view'],
      isManaged: true,
    },
    {
      id: 'managed-channel-readonly',
      name: 'Read Only',
      description: 'Read-only access to channel content and resources.',
      permissions: ['channel.content.view', 'channel.assessments.view', 'channel.members.view'],
      isManaged: true,
    },
  ],
  customPolicies: [
    {
      id: 'custom-channel-1',
      name: 'BCA Faculty',
      description: 'Custom policy for the BCA course faculty.',
      permissions: ['channel.content.view', 'channel.content.create', 'channel.assessments.manage'],
      isManaged: false,
    },
  ],
  metadata: {
    'channel.content.delete': {
      scope: 'CHANNEL',
      riskLevel: 'HIGH',
      description: 'Permanently deletes content and all associated data.',
      dependencies: ['channel.content.view', 'channel.content.create'],
    },
    'channel.content.publish': {
      scope: 'CHANNEL',
      riskLevel: 'MEDIUM',
      description: 'Makes content publicly visible to channel members.',
      dependencies: ['channel.content.view'],
    },
    'channel.members.remove': {
      scope: 'CHANNEL',
      riskLevel: 'MEDIUM',
      description: 'Removes members from this channel, revoking their access.',
      dependencies: ['channel.members.view'],
    },
    'channel.settings.manage': {
      scope: 'CHANNEL',
      riskLevel: 'HIGH',
      description: 'Full control over channel settings including name, description, and visibility.',
      dependencies: ['channel.settings.view'],
    },
  },
};

const PUBLISHER_SNAPSHOT: IAMEditorSnapshot = {
  scope: 'PUBLISHER',
  hierarchy: [
    {
      id: 'publisher',
      name: 'Publisher',
      children: [
        {
          id: 'publisher.channels',
          name: 'Channels',
          children: [
            { id: 'publisher.channels.view', name: 'View Channels' },
            { id: 'publisher.channels.create', name: 'Create Channels' },
            { id: 'publisher.channels.delete', name: 'Delete Channels' },
          ],
        },
        {
          id: 'publisher.members',
          name: 'Members',
          children: [
            { id: 'publisher.members.view', name: 'View Members' },
            { id: 'publisher.members.manage', name: 'Manage Members' },
          ],
        },
        {
          id: 'publisher.policies',
          name: 'Policies',
          children: [
            { id: 'publisher.policies.view', name: 'View Policies' },
            { id: 'publisher.policies.manage', name: 'Manage Policies' },
          ],
        },
      ],
    },
  ],
  managedBundles: [
    {
      id: 'managed-publisher-admin',
      name: 'Publisher Administrator',
      description: 'Full control over the publisher organization.',
      permissions: ['publisher.channels.view', 'publisher.channels.create', 'publisher.channels.delete', 'publisher.members.manage', 'publisher.policies.manage'],
      isManaged: true,
    },
    {
      id: 'managed-publisher-member',
      name: 'Publisher Member',
      description: 'Basic membership with read-only access to the organization.',
      permissions: ['publisher.channels.view', 'publisher.members.view'],
      isManaged: true,
    },
  ],
  customPolicies: [],
  metadata: {},
};

const SCOPE_MAP: Record<Scope, IAMEditorSnapshot> = {
  PLATFORM: PLATFORM_SNAPSHOT,
  CHANNEL: CHANNEL_SNAPSHOT,
  PUBLISHER: PUBLISHER_SNAPSHOT,
};

export class IAMService {
  /**
   * Fetches the IAM Editor snapshot for a given scope.
   * Platform context returns only Platform permissions.
   * Channel context returns only Channel permissions.
   */
  static async getEditorSnapshot(scope: Scope = 'PLATFORM'): Promise<IAMEditorSnapshot> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return SCOPE_MAP[scope] ?? PLATFORM_SNAPSHOT;
  }
}

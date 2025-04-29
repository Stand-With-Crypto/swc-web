# SendGrid Integration for Marketing Emails

This integration allows you to sync SWC users to SendGrid Marketing Campaigns by country, enabling your regional teams to send targeted marketing emails.

## Setup

### 1. SendGrid Account Setup

1. Create subuser accounts for each region (e.g., `australiaMarketing`, `ukMarketing`)
2. Grant each subuser access to Marketing Campaigns
3. Create an API key in your parent account with full access to Marketing Campaigns and Contacts

### 2. Environment Variables

Add the following environment variable to your project:

```
SENDGRID_API_KEY=your_api_key_here
```

### 3. User Sync

The integration includes an Inngest cron job that runs daily to sync users from your database to SendGrid contacts. The job:

1. Fetches users from your database
2. Groups them by country
3. Creates country-specific lists in the appropriate subuser accounts
4. Uploads users to SendGrid with metadata

## Usage

### Accessing SendGrid Marketing Campaigns

1. Have your regional teams log in using their respective subuser accounts
2. They'll only see contacts for their region
3. They can create and send campaigns using the SendGrid UI

### Custom Fields

The integration includes the following custom fields for each contact:

- `user_id` - The SWC database ID for the user
- `country` - The user's country
- `signup_date` - The date the user signed up (YYYY-MM-DD format)

You can add additional custom fields by modifying the `sendgrid-sync.ts` file.

## Best Practices

1. **Domain Authentication**: Set up domain authentication for better deliverability
2. **Unsubscribe Management**: Always include unsubscribe links in your emails
3. **Template Design**: Create reusable templates with consistent branding
4. **Testing**: Use SendGrid's testing tools before sending to real users
5. **Segmentation**: Use custom fields to create targeted segments within each country

## Troubleshooting

If contacts aren't syncing properly:

1. Check Inngest logs for any errors
2. Verify the SendGrid API key has the correct permissions
3. Make sure subusers are properly configured
4. Check database queries to ensure users are being fetched correctly

## Adding New Regions

To add support for a new region:

1. Create a new subuser in SendGrid (e.g., `canadaMarketing`)
2. The sync job will automatically create contact lists for any country with users
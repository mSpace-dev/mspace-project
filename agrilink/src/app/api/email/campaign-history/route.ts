import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import EmailCampaign from '@/lib/models/EmailCampaign';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status'); // 'sent', 'failed', 'partial'
    const campaignType = searchParams.get('type'); // 'manual', 'automated'

    // Build filter query
    const filter: any = {};
    if (status) filter.status = status;
    if (campaignType) filter.campaignType = campaignType;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get campaigns with pagination
    const campaigns = await EmailCampaign.find(filter)
      .select('subject message sentAt sentToCount sentBy status errorCount campaignType')
      .sort({ sentAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalCampaigns = await EmailCampaign.countDocuments(filter);
    const totalPages = Math.ceil(totalCampaigns / limit);

    // Get summary statistics
    const stats = await EmailCampaign.aggregate([
      {
        $group: {
          _id: null,
          totalCampaigns: { $sum: 1 },
          totalEmailsSent: { $sum: '$sentToCount' },
          successfulCampaigns: {
            $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] }
          },
          failedCampaigns: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          },
          partialCampaigns: {
            $sum: { $cond: [{ $eq: ['$status', 'partial'] }, 1, 0] }
          }
        }
      }
    ]);

    return NextResponse.json({
      campaigns,
      pagination: {
        currentPage: page,
        totalPages,
        totalCampaigns,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      statistics: stats[0] || {
        totalCampaigns: 0,
        totalEmailsSent: 0,
        successfulCampaigns: 0,
        failedCampaigns: 0,
        partialCampaigns: 0
      }
    });

  } catch (error) {
    console.error('Email campaign history API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email campaign history' },
      { status: 500 }
    );
  }
}

// Delete a specific campaign (optional feature)
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('id');

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    const deletedCampaign = await EmailCampaign.findByIdAndDelete(campaignId);

    if (!deletedCampaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully'
    });

  } catch (error) {
    console.error('Delete campaign API error:', error);
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    );
  }
}

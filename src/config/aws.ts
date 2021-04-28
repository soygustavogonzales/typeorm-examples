process.env.AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID_TEST;
process.env.AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY_TEST;

export default {
  aws_region: process.env.AWS_REGION,
  aws_api_stage_name: process.env.AWS_API_STAGE_NAME,
  aws_access_key_id: process.env.AWS_ACCESS_KEY_ID,
  aws_secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
  aws_s3_bucket_name: process.env.AWS_S3_BUCKET_NAME,
  aws_sns_topic_arn: process.env.AWS_SNS_TOPIC_ARN,
  aws_queue_sqs_jda_sku_sync_url: process.env.AWS_QUEUE_SQS_JDA_SKU_SYNC_URL,
};

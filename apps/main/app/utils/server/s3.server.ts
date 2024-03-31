import { PassThrough } from 'stream'
import {
	type UploadHandlerPart,
	writeAsyncIterableToWritable,
} from '@remix-run/node'
import AWS from 'aws-sdk'

const {
	AWS_ACCESS_KEY,
	AWS_SECRET_ACCESS_KEY,
	AWS_REGION,
	AWS_PRIVATE_BUCKET,
	AWS_PUBLIC_BUCKET,
} = process.env

if (
	!(
		AWS_ACCESS_KEY &&
		AWS_SECRET_ACCESS_KEY &&
		AWS_REGION &&
		AWS_PUBLIC_BUCKET &&
		AWS_PRIVATE_BUCKET
	)
) {
	throw new Response('awsMissingConfiguration', {
		status: 404,
	})
}

const s3 = new AWS.S3({
	credentials: {
		accessKeyId: AWS_ACCESS_KEY,
		secretAccessKey: AWS_SECRET_ACCESS_KEY,
	},
	region: AWS_REGION,
	signatureVersion: 'v4',
})

const uploadStream = (
	{
		Key,
		ContentType,
	}: Pick<AWS.S3.Types.PutObjectRequest, 'Key' | 'ContentType'>,
	isPrivate: boolean,
) => {
	const pass = new PassThrough()

	return {
		writeStream: pass,
		promise: s3
			.upload({
				Bucket: isPrivate ? AWS_PRIVATE_BUCKET : AWS_PUBLIC_BUCKET,
				Key,
				Body: pass,
				ACL: isPrivate ? 'private' : 'public-read',
				ContentDisposition: 'inline',
				ContentType,
			})
			.promise(),
	}
}

async function checkS3ImageAvailability(url: string) {
	let retries = 3

	while (retries > 0) {
		try {
			const response = await fetch(url, { method: 'HEAD' })
			if (response.ok) {
				return true
			}
		} catch (error) {
			console.error('Error checking S3 image:', error)
		}
		retries -= 1
		await new Promise(resolve => setTimeout(resolve, 500))
	}
}

async function uploadStreamToS3(
	data: any,
	filename: string,
	fileType: string,
	isPrivate: boolean,
) {
	const uniqueFilename = encodeURIComponent(
		`${Date.now()}_${filename
			.replace(/[^a-zA-Z0-9\-_.]/g, '_')
			.replace(/ /g, '_')}`,
	)

	const stream = uploadStream(
		{
			Key: uniqueFilename,
			ContentType: fileType,
		},
		isPrivate,
	)

	await writeAsyncIterableToWritable(data, stream.writeStream)

	return uniqueFilename
}

export const uploadImageToS3 = async (
	{ filename, data, contentType }: UploadHandlerPart,
	isPrivate = true,
) => {
	if (!filename) {
		return undefined
	}

	const uniqueFilename = await uploadStreamToS3(
		data,
		filename,
		contentType,
		isPrivate,
	)

	const url = `https://${isPrivate ? AWS_PRIVATE_BUCKET : AWS_PUBLIC_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${uniqueFilename}`

	if (filename) {
		await checkS3ImageAvailability(url)
	}

	return url
}

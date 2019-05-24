const gulp = require('gulp')
const AWS = require('aws-sdk')
const awspublish = require('gulp-awspublish')
const parallelize = require('concurrent-transform')
const rename = require('gulp-rename')

const { version } = require('./package.json')

const bucket = 'combining-react-and-d3'
const distrId = 'E3PF43TMM1FXNT'

const awsConfig = require('./awsConfig.json')
AWS.config.loadFromPath('./awsConfig.json')

const cloudfront = new AWS.CloudFront()
const s3 = new AWS.S3()

const buildPath = './build'

gulp.task('s3versionCheck', (cb) => {
  s3.listObjects({ Bucket: bucket, Prefix: `v${version}` }, (err, data) => {
    if (err)
      throw new Error(`[AWS-ERROR]: could not list ths bucket's (${bucket}) contents. \n${err}`)
    const { Contents: { length } = [] } = data
    if (length) throw new Error(`[DEPLOYMENT]: this version was already deployed, aborting...`)
    cb()
  })
})

gulp.task('s3deploy', () => {
  const publisher = awspublish.create({
    region: 'us-east-1',
    params: { Bucket: bucket },
    accessKeyId: awsConfig.accesKeyId,
    secretAccessKey: awsConfig.secretAccessKey,
  })

  return gulp
    .src(`${buildPath}/**/*`)
    .pipe(rename((path) => (path.dirname = `v${version}/${path.dirname}`)))
    .pipe(parallelize(publisher.publish(), 10))
    .pipe(publisher.sync(`v${version}`, []))
    .pipe(awspublish.reporter({}))
})

gulp.task('invalidateCloudFrontCache', (cb) => {
  const options = {
    DistributionId: distrId,
    InvalidationBatch: {
      CallerReference: `soundboard-v${version}`,
      Paths: {
        Quantity: 1,
        Items: ['/*'],
      },
    },
  }

  cloudfront.createInvalidation(options, (err, data) => {
    if (err) throw new Error(`[AWS-ERROR]: could not invalidate cache \n${err}`)
    const { Location } = data
    console.log(`[AWS-SUCCESS]: successfully invalidated cache`, Location)
    cb()
  })
})

gulp.task('updateDistr', (cb) => {
  cloudfront.getDistributionConfig({ Id: distrId }, (err, data) => {
    if (err) console.error('[AWS-ERROR]: could not get distribution configuration.', err)
    else {
      data.Origins.Items[0].OriginPath = '/v' + version
      data.Id = distrId
      data.IfMatch = data.ETag

      delete data.ETag

      cloudfront.updateDistribution(data, (err) => {
        if (err) console.error('[AWS-ERROR]: could not update distribution', err)
        else {
          console.log('[AWS-SUCCESS]: sucessfully updated distribution')
          cb()
        }
      })
    }
  })
})

gulp.task(
  'deploy',
  gulp.series('s3versionCheck', 's3deploy', 'updateDistr', 'invalidateCloudFrontCache'),
)

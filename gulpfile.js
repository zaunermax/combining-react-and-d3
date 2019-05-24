const gulp = require('gulp')
const AWS = require('aws-sdk')
const awspublish = require('gulp-awspublish')
const parallelize = require('concurrent-transform')
const rename = require('gulp-rename')

const storyDeploy = process.env.DEPLOY_STORY

const version = '1.0.0'

const bucket = !storyDeploy ? 'combining-react-and-d3' : 'combining-react-and-d3-storybook'
const distrId = !storyDeploy ? 'E3PF43TMM1FXNT' : 'EFRPAR6FIHA21'

const awsConfig = require('./awsConfig.json')
AWS.config.loadFromPath('./awsConfig.json')

const cloudfront = new AWS.CloudFront()

const buildPath = !storyDeploy ? './build' : './storybook-static'

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
      CallerReference: `react&d3-v${version}`,
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

gulp.task('deploy', gulp.series('s3deploy', 'updateDistr', 'invalidateCloudFrontCache'))

const nodemailer = require('nodemailer')
const smtpTransport = require('nodemailer-smtp-transport')
const EmailTemplate = require('swig-email-templates')
const TEMPLATES = {
    forgotPassword: 'forgot-password.html'
}

class Mailer {
    constructor() {
        this.isReady = false

        this.transporter = nodemailer.createTransport(smtpTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            pool: true,
            secure: process.env.SMTP_SERVICE.toLowerCase() === 'gmail'
        }))

        this.transporter.verify(error => {
            if (error) {
                console.log('ERROR', error)
                process.exit(1)
            } else {
                this.isReady = true
                console.log('Mailer is ready to send email.')
            }
        })
    }

    async sendMail(from, to, subject = 'New Message', html = '') {
        const message = {
            from: from || process.env.DEFAULT_EMAIL,
            to: to || process.env.DEFAULT_EMAIL,
            subject,
            html
        }

        let results = await this.transporter.sendMail(message)

        console.log('Message sent: ', results.messageId)
        return results
    }

    async sendTemplate(from, to, subject = 'New Message', template, data = {}) {
        const { html, text } = await new Promise((resolve, reject) => {
            new EmailTemplate().render(__dirname + '/../email-templates/' + template, data, (err, html, text) => {
                if (err) {
                    reject(err)
                } else {
                    resolve({ html, text })
                }
            })
        })

        const message = {
            from: from || process.env.DEFAULT_EMAIL,
            to: to || process.env.DEFAULT_EMAIL,
            subject,
            html,
            text
        }

        let results = await this.transporter.sendMail(message)

        console.log('Message sent: ', results.messageId)
        return results
    }

    close() {
        this.transporter.close()
    }
}

module.exports = {
    mailer: new Mailer(),
    TEMPLATES
}
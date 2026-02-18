// schedule.service.ts
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as nodemailer from 'nodemailer';

interface EmailJob {
    to: string;
    subject: string;
    body: string;
}

@Injectable()
export class ScheduleService {
    private emailQueue: EmailJob[] = [];

    private transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    addEmailJob(job: EmailJob) {
        this.emailQueue.push(job);
    }

    @Cron(CronExpression.EVERY_30_SECONDS)
    async handleCron() {
        if (this.emailQueue.length === 0) {
            return;
        }

        console.log(`Processing Emails`);

        const jobsToProcess = [...this.emailQueue];
        this.emailQueue = [];

        for (const job of jobsToProcess) {
            await this.sendEmail(job);
        }
    }

    private async sendEmail(job: EmailJob) {
        try {
            await this.transporter.sendMail({
                from: `"My App" <${process.env.EMAIL_USER}>`,
                to: job.to,
                subject: job.subject,
                text: job.body,
            });

            console.log(`Email sent to ${job.to}`);
        } catch (error) {
            console.error('Email failed:', error);
        }
    }
}

import { Injectable } from "@nestjs/common";
import mailgun from "mailgun-js";
import { EmailDto, EmailOtpDto } from "./dto/email.dto";
import { LoggerService } from "@modules/logger/logger.service";
import { TemplateWelcome } from "./templates/welcome";
import { ConfigService } from "@nestjs/config";
import { OtpTemplate } from "./templates/otp-email";
import { MintTemplate } from "./templates/mint-email";
import { RedeemTemplate } from "./templates/redeem-email";
import { SendEmailTemplate } from "./templates";
import { NotificationType } from "src/schema/notification.schema";

@Injectable()
export class EmailService {
  private mailGun: mailgun.Mailgun;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get("MAILGUN_API_KEY");
    const domain = this.config.get("MAILGUN_DOMAIN");
    this.mailGun = mailgun({ apiKey, domain });
  }

  async sendEmail(sendEmailDto: EmailDto): Promise<void> {
    const { recipient, subject, text } = sendEmailDto;

    const data = {
      from: this.config.get("EMAIL_FROM"),
      to: recipient,
      subject: subject,
      html: TemplateWelcome(text),
    };

    try {
      await this.mailGun.messages().send(data);
      LoggerService.debug("Email sent successfully.");
    } catch (error) {
      LoggerService.error("Failed to send email:", error);
    }
  }

  async sendEmailOtp(sendEmailDto: EmailOtpDto) {
    const { recipient, subject, otp, walletAddress } = sendEmailDto;
    const bodyTemplate = OtpTemplate(walletAddress, otp);
    const data = {
      from: this.config.get("EMAIL_FROM"),
      to: recipient,
      subject: subject,
      html: SendEmailTemplate(bodyTemplate),
    };

    try {
      await this.mailGun.messages().send(data);
      LoggerService.debug("Email sent successfully.");
    } catch (error) {
      LoggerService.error("Failed to send email:", error);
    }
  }

  async sendEmailTransaction(message: any, event: NotificationType): Promise<void> {
    const { recipient, subject, walletAddress, transactionHash, network } = message;
    let data;
    let bodyTemplate;
    switch (event) {
      case NotificationType.MINT:
        bodyTemplate = MintTemplate(walletAddress, transactionHash, network);
        data = {
          from: this.config.get("EMAIL_FROM"),
          to: recipient,
          subject: subject,
          html: SendEmailTemplate(bodyTemplate),
        };
        break;
      case NotificationType.REDEEM:
        bodyTemplate = RedeemTemplate(walletAddress, transactionHash, network);
        data = {
          from: this.config.get("EMAIL_FROM"),
          to: recipient,
          subject: subject,
          html: SendEmailTemplate(bodyTemplate),
        };
        break;
      default:
        break;
    }

    try {
      await this.mailGun.messages().send(data);
      LoggerService.debug("Email sent successfully.");
    } catch (error) {
      LoggerService.error("Failed to send email:", error);
    }
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Invoice } from './invoice.schema';
import { Model } from 'mongoose';
import { ActivityService } from 'src/activity/activity.service';
import { QueryDto } from 'src/product/query.dto';
import { log } from 'src/do_logger';



@Injectable()
export class InvoiceService {
  // , private whatsappService: WhatsappService
  constructor(@InjectModel(Invoice.name) private readonly invoiceModel: Model<Invoice>, private logService: ActivityService) { }
  async create(createInvoiceDto: CreateInvoiceDto, req: any) {
    try {
      createInvoiceDto['initiator'] = req.user.username
      createInvoiceDto['location'] = req.user.location;
      const invoice = await this.invoiceModel.create(createInvoiceDto)
      this.logService.logAction(req.user.userId, req.user.username, 'Create Invoice', `Created Invoice for user with id ${invoice.customer}`)
      return invoice;
    } catch (error) {
      log(`error creating  invoice ${error}`, "ERROR")
      throw new BadRequestException(error);
    }

  }

  async findAll(query: QueryDto, req: any): Promise<Invoice[]> {
    const {
      filter = '{}',
      sort = '{}',
      skip = 0,
      select = '',
      limit = 10,
      startDate,
      endDate,
      selectedDateField
    } = query;

    const parsedFilter = JSON.parse(filter);
    const parsedSort = JSON.parse(sort);
    try {
      if (startDate && endDate && selectedDateField) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0); // Start of day

        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // End of day

        parsedFilter[selectedDateField] = { $gte: start, $lte: end };
      }

      // Handle customer search
      if (parsedFilter.customer) {
        const customerQuery = parsedFilter.customer;
        delete parsedFilter.customer;

        parsedFilter['$or'] = [
          { 'customer.name': { $regex: customerQuery['$regex'], $options: 'i' } },
          { 'customer.phone_number': { $regex: customerQuery['$regex'], $options: 'i' } }
        ];
      }

      const result = await this.invoiceModel.find({ ...parsedFilter, location: req.user.location })
        .sort(parsedSort)
        .skip(Number(skip))
        .limit(Number(limit))
        .select(select)
        .populate('bank customer')
        .exec();
      return result;
    } catch (error) {
      log(`Error fetching invoices: ${error.message}`, "ERROR")
      throw new Error(`Error fetching invoices: ${error.message}`);
    }
  }

  async findAllCustomersInvoices(query: QueryDto, req: any): Promise<{ result: Invoice[], totalDocuments: number }> {
    const {
      filter = '{}',
      sort = '{}',
      skip = 0,
      select = '',
      limit = 10,
      startDate,
      endDate,
      selectedDateField
    } = query;

    const parsedFilter = JSON.parse(filter);
    const parsedSort = JSON.parse(sort);

    try {
      if (startDate && endDate && selectedDateField) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0); // Start of day

        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // End of day

        parsedFilter[selectedDateField] = { $gte: start, $lte: end };
      }

      const result = await this.invoiceModel.find({ ...parsedFilter, location: req.user.location })
        .sort(parsedSort)
        .skip(Number(skip))
        .limit(Number(limit))
        .populate('bank customer')
        .select(select)
        .exec();

      const totalDocuments = await this.invoiceModel
        .countDocuments({ ...parsedFilter, location: req.user.location })
        .exec();

      return { result, totalDocuments };

    } catch (error) {
      log(`Error fetching invoices: ${error.message}`, "ERROR")
      throw new Error(`Error fetching invoices: ${error.message}`);
    }
  }

  findOne(filter: string) {
    try {
      return this.invoiceModel.findOne(JSON.parse(filter));
    } catch (error) {
      log(`Error fetching one invoice: ${error.message}`, "ERROR")
      throw new Error(`Error fetching invoices: ${error.message}`);
    }

  }

  async update(filter: string, updateInvoiceDto: UpdateInvoiceDto, req: any) {

    const invoice = await this.invoiceModel.findOne(JSON.parse(filter))


    if (!invoice) {
      throw new Error(`Invoice not found`);
    }

    Object.keys(updateInvoiceDto).forEach(key => {
      invoice[key] = updateInvoiceDto[key];
    })
    try {
      await this.logService.logAction(req.user.userId, req.user.username, 'Update Invoice', `Updated Invoice with id ${filter}`)
      return invoice.save();
    } catch (error) {
      log(`Error updating one invoice: ${error}`, "ERROR")
      throw new Error(`Error updating invoices: ${error.message}`);
    }

  }

  async sendMessage(id: string) {
    const invoice = await this.invoiceModel.findById(id).populate('customer') as any;


    invoice.customer.phone_number = this.formatPhoneNumber(invoice.customer.phone_number)


    // const media = new MessageMedia(
    //   'application/pdf',
    //   pdf.toString('base64'),
    //   `invoice_for_${invoice.customer.name}.pdf`,
    // );

    // const messade = await this.whatsappService.sendMessage(invoice.customer.phone_number, media);
    // return messade;
  }

  async remove(filter: any, req: any) {
    try {
      await this.invoiceModel.findOneAndDelete(filter)
      await this.logService.logAction(req.user.userId, req.user.username, 'Remove Invoice', `Removed Invoice with filter ${JSON.stringify(filter)}`)
      return true;
    } catch (error) {
      log(`Error removing one invoice: ${error}`, "ERROR")
      throw new Error(`Error removing invoices: ${error.message}`);
    }

  }

  formatPhoneNumber(phone: string): string {
    // Remove non-digit characters
    const digits = phone.replace(/\D/g, '');

    if (digits.startsWith('0')) {
      return `234${digits.substring(1)}@c.us`;
    } else if (digits.startsWith('234')) {
      return `${digits}@c.us`;
    } else {
      throw new Error('Invalid Nigerian phone number');
    }
  }
}

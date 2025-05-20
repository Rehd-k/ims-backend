import { Injectable } from '@nestjs/common';
import { CreateChargeDto } from './dto/create-charge.dto';
import { UpdateChargeDto } from './dto/update-charge.dto';
import { Charge } from './entities/charge.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ChargesService {
  constructor(
    @InjectModel(Charge.name) private readonly chargeModel: Model<Charge>
  ) { }
  async create(createChargeDto: any, req: any) {
    createChargeDto.location = req.user.location
    createChargeDto.initiator = req.user.username
    const newCharge = await this.chargeModel.create(createChargeDto)
    return newCharge;
  }

  async findAll(req: any) {
    const charges = await this.chargeModel.find({ location: req.user.location })
    return charges;
  }

  async findOne(id: string) {
    const charges = await this.chargeModel.findOne({ _id: id })
    return charges;
  }

  async update(id: string, updateChargeDto: UpdateChargeDto) {
    const charges = await this.chargeModel.findByIdAndUpdate(id, { $set: updateChargeDto }, { new: true })
    return charges;
  }

  async remove(id: string) {
    return this.chargeModel.findByIdAndDelete(id)
  }
}

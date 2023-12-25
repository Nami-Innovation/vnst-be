import { Controller, Get, Query } from "@nestjs/common";
import { EventLogsService } from "./event-logs.service";
import {
  EventLogQueryByTransactionDTO,
  EventLogQueryDTO,
} from "./dto/event-log-query.dto";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("Event Logs")
@Controller("event-logs")
export class EventLogsController {
  constructor(private readonly eventLogsService: EventLogsService) {}

  @Get("/")
  findAll(@Query() query: EventLogQueryDTO) {
    return this.eventLogsService.findAll(query);
  }

  @Get("/by-transaction")
  getEventLogByTrasaction(@Query() query: EventLogQueryByTransactionDTO) {
    return this.eventLogsService.getEventLogByTrasaction(query);
  }
}

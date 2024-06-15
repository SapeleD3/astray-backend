import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiGroup } from '../../../commons/enums';
import {
  AuthUser,
  EditUserPayload,
  SaveAccountDetailsPayload,
  UserService,
} from '../services';
import { AuthGuard } from '../../../commons/gaurds/user.authentication.guard';
import {
  AuthenticatedUserResponse,
  UserSignInRequest,
  UserSignUpRequest,
} from './dto';
import { AuthGuardRequest } from '../../../commons';
import {
  GetNipAccountDetailsResponse,
  PaystackBankList,
} from '../../../providers';
import { User, VirtualAccount } from '@prisma/client';

@ApiTags(ApiGroup.User)
@Controller(ApiGroup.User)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/register')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User Sign up endpoint.',
  })
  @ApiResponse({
    description: 'User sign up details.',
    status: HttpStatus.OK,
    type: AuthenticatedUserResponse,
  })
  @ApiResponse({
    description: 'Invalid parameters provided.',
    status: HttpStatus.BAD_REQUEST,
  })
  async userSignUp(
    @Body() userSignUpRequest: UserSignUpRequest,
  ): Promise<AuthenticatedUserResponse> {
    const authenticatedUser = await this.userService.userRegistration(
      userSignUpRequest,
    );
    return new AuthenticatedUserResponse(authenticatedUser);
  }

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login endpoint.',
  })
  @ApiResponse({
    description: 'User login details.',
    status: HttpStatus.OK,
    type: AuthenticatedUserResponse,
  })
  @ApiResponse({
    description: 'Invalid parameters provided.',
    status: HttpStatus.BAD_REQUEST,
  })
  @ApiResponse({
    description: 'User not found.',
    status: HttpStatus.NOT_FOUND,
  })
  async userLogin(
    @Body() userSignInRequest: UserSignInRequest,
  ): Promise<AuthenticatedUserResponse> {
    const authenticatedUser = await this.userService.userLogin(
      userSignInRequest,
    );
    return new AuthenticatedUserResponse(authenticatedUser);
  }
}

// authenticated user routes
@UseGuards(AuthGuard)
@Controller({
  path: `/auth/${ApiGroup.User}`,
})
export class AuthUserController {
  constructor(private readonly userService: UserService) {}

  @Get('')
  @HttpCode(HttpStatus.OK)
  async fetchAuthUser(@Request() request: AuthGuardRequest): Promise<AuthUser> {
    const user = await this.userService.fetchAuthUser(request.id);
    return user;
  }

  @Put('')
  @HttpCode(HttpStatus.OK)
  async editUser(
    @Request() request: AuthGuardRequest,
    @Body() editUserPayload: EditUserPayload,
  ): Promise<Partial<User>> {
    const user = await this.userService.editUser(request.id, editUserPayload);
    return user;
  }

  @Get('/banklist')
  @HttpCode(HttpStatus.OK)
  async fetchBankList(): Promise<PaystackBankList[]> {
    const banklist = await this.userService.fetchValidBankList();
    return banklist;
  }

  @Get('/NipDetails')
  @HttpCode(HttpStatus.OK)
  async fetchNipBankDetails(
    @Query('accountNumber') accountNumber: string,
    @Query('bankCode') bankCode: string,
  ): Promise<GetNipAccountDetailsResponse> {
    const bankDetails = await this.userService.getNipBankDetails({
      accountNumber,
      bankCode,
    });
    return bankDetails;
  }

  @Post('/save-account')
  @HttpCode(HttpStatus.OK)
  async saveAccountDetails(
    @Request() request: AuthGuardRequest,
    @Body() payload: SaveAccountDetailsPayload,
  ): Promise<Partial<VirtualAccount>> {
    const virtualAccount = await this.userService.saveAccountDetails(
      request.id,
      payload,
    );
    return virtualAccount;
  }
}

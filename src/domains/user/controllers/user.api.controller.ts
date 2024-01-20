import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiGroup } from '../../../commons/enums';
import { UserService } from '../services';
import {
  AuthenticatedUserResponse,
  UserSignInRequest,
  UserSignUpRequest,
} from './dto';

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

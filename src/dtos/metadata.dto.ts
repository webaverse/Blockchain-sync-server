import { IMetadataAttribute } from '@/interfaces/metadata.interface';
import { IsString, IsArray, IsOptional, IsUrl, IsDataURI } from 'class-validator';

export class FetchMetaDataDto {
  @IsOptional()
  @IsString({
    message: 'MetaData name is not valid',
  })
  public name: string;

  @IsOptional()
  @IsUrl({
    message: 'Image is not valid',
  })
  public image?: string;

  @IsOptional()
  @IsDataURI({
    message: 'Image_data is not valid',
  })
  public image_data?: string;

  @IsOptional()
  @IsString({
    message: 'External url is not valid',
  })
  public external_url?: string;

  @IsOptional()
  @IsString({
    message: 'Description is not valid',
  })
  public description?: string;

  @IsOptional()
  @IsArray()
  public attributes: IMetadataAttribute[];

  @IsOptional()
  @IsString({
    message: 'Background color is not valid',
  })
  public background_color: string;

  @IsOptional()
  @IsUrl({
    message: 'Animation url is not valid',
  })
  public animation_url: string;

  @IsOptional()
  @IsUrl({
    message: 'Youtube url is not valid',
  })
  public youtube_url: string;
}

import CheerioStatic from 'cheerio';
import * as _ from 'lodash';
import {AbstractExtractor} from 'app/import/extractor/abstractExtractor';

export class MetaExtractor extends AbstractExtractor {

  /**
   * extract name
   * @override
   * @param {Cheerio} $
   */
  protected setName($: CheerioStatic): void {
    this.name = this.name.concat(
      $('meta[property="og:title"]').attr('content'),
      $('meta[property="twitter:title"]').attr('content')
    );
  }

  /**
   * extract description
   * @override
   * @param {Cheerio} $
   */
  protected setDescription($: CheerioStatic): void {
    this.description = this.description.concat([
      $('meta[property="og:description"]').attr('content'),
      $('meta[name="og:description"]').attr('content'),
      $('meta[name="description"]').attr('content'),
      $('meta[property="twitter:description"]').attr('content')
    ]);
  }

  /**
   * extract image url for activity
   * @override
   * @param {Cheerio} $
   */
  protected setImage($: CheerioStatic): void {
    this.image = this.image.concat([
      $('meta[property="og:image"]').attr('content'),
      $('meta[property="og:image:url"]').attr('content'),
      $('meta[property="og:image:secure_url"]').attr('content'),
      $('meta[property="twitter:image:src"]').attr('content'),
      $('section.main_photo img').attr('src')
    ]);
  }

  /**
   * extract image url for activity
   * @override
   * @param {Cheerio} $
   */
  protected setVideo($: CheerioStatic): void {
    this.video = this.video.concat([
      $('meta[property="og:video:url"]').attr('content'),
      $('meta[property="og:video:secure_url"]').attr('content')
    ]);
  }

  /**
   * @override
   * @param {Cheerio} $
   */
  protected setCreatedAt($: CheerioStatic): void {
    this.createdAt = this.createdAt.concat([
      $('meta[property="og:video:release_date"]').attr('content'),
      $('meta[property="og:article:published_time"]').attr('content')
    ]);
  }

  /**
   * extract all possible tags
   * @override
   * @param {Cheerio} $
   */
  protected setTags($: CheerioStatic): void {
    let articleTags = $('meta[property="article:tag"]')
      .toArray()
      .map(el => $(el).attr('content'));
    // sometimes content contains tags separated by ' '
    if (articleTags.length === 1) {
      articleTags = articleTags[0].split(' ');
    }

    let videoTags = $('meta[property="og:video:tag"]')
      .toArray()
      .map(el => $(el).attr('content'));

    let keywords = this.getTagsFromKeywords(
      $('meta[name="keywords"]').attr('content')
    );

    let news_keywords = this.getTagsFromKeywords(
      $('meta[name="news_keywords"]').attr('content')
    );

    this.tags = this.tags.concat(
      _.union(
        articleTags,
        videoTags,
        keywords,
        news_keywords
      )
    );
  }

  /**
   * split sentences found in keywords tag
   * @param {string} keywords
   * @returns {string[]}
   */
  protected getTagsFromKeywords(keywords: string): string[] {
    if (!keywords) {

      return [];
    }
    let result = [];

    if (keywords.indexOf(',') !== -1) {
      // check if separator is ','
      result = keywords.split(',');
    } else {
      // check if separator is ' '
      result = keywords.split(' ');
    }

    return result;
  }
}

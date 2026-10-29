<?php

namespace App\Support\Seo;

/**
 * Who Good Morning is, in the words every page's meta and graph share: the
 * names it goes by, where it is, what it sells and since when. Kept in one
 * place so a title, a description and the knowledge-graph entry can never
 * disagree.
 */
final class Shop
{
    /** The short name, as it reads in a title. */
    public const string NAME = 'Good Morning';

    /** The name people search for, with the town that tells it apart. */
    public const string FULL_NAME = 'Good Morning Aley';

    public const int FOUNDED = 2011;

    public const string LOCALITY = 'Aley';

    public const string REGION = 'Mount Lebanon';

    public const string COUNTRY = 'LB';

    public const string COUNTRY_NAME = 'Lebanon';

    /**
     * The one Open Graph image every page shares: the logo on the shop's
     * cream, at the size link previews render from before it has downloaded.
     */
    public const string IMAGE = 'og/good-morning.jpg';

    public const int IMAGE_WIDTH = 1200;

    public const int IMAGE_HEIGHT = 630;

    public const string IMAGE_ALT = 'The Good Morning logo, the sun rising over its name, on the shop cream';

    /** The square mark, for the logo in the knowledge graph. */
    public const string LOGO = 'web-app-manifest-512x512.png';

    /** What the shop is, one line, used wherever a page has nothing better to say. */
    public const string DESCRIPTION = 'Good Morning in Aley, Lebanon: fresh crepes, waffles, pancakes, '
        .'avocado cocktails, fresh juices and milkshakes since 2011. Dine in or order for delivery.';

    /** What the kitchen makes, as schema.org cuisines. */
    public const array CUISINES = ['Desserts', 'Crepes', 'Waffles', 'Pancakes', 'Fresh juice', 'Milkshakes', 'Fruit cocktails', 'Breakfast'];

    /**
     * The searches the shop should be found for, in English and in Arabic,
     * the way people in Lebanon type them.
     */
    public const string KEYWORDS = 'Good Morning Aley, Good Morning Lebanon, desserts Aley, crepes Aley, waffles Aley, '
        .'pancakes Aley, fresh juice Aley, avocado cocktail Aley, milkshakes Aley, dessert shop Mount Lebanon, '
        .'dessert delivery Aley, حلويات عاليه, كريب عاليه, وافل عاليه, عصير طازج عاليه, كوكتيل أفوكادو, '
        .'غود مورنينغ عاليه, ديليفري حلويات عاليه';

    /** The title for any page, with the shop's name after the page's own. */
    public static function title(string $page): string
    {
        return $page.' | '.self::FULL_NAME;
    }

    /** How many years the shop has been serving, as of this year. */
    public static function years(): int
    {
        return (int) now()->year - self::FOUNDED;
    }
}

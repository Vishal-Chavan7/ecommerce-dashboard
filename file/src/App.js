import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePageOne from "./pages/HomePageOne";
import HomePageTwo from "./pages/HomePageTwo";
import HomePageThree from "./pages/HomePageThree";
import HomePageFour from "./pages/HomePageFour";
import HomePageFive from "./pages/HomePageFive";
import HomePageSix from "./pages/HomePageSix";
import HomePageSeven from "./pages/HomePageSeven";
import EmailPage from "./pages/EmailPage";
import AddUserPage from "./pages/AddUserPage";
import AlertPage from "./pages/AlertPage";
import AssignRolePage from "./pages/AssignRolePage";
import AvatarPage from "./pages/AvatarPage";
import BadgesPage from "./pages/BadgesPage";
import ButtonPage from "./pages/ButtonPage";
import CalendarMainPage from "./pages/CalendarMainPage";
import CardPage from "./pages/CardPage";
import CarouselPage from "./pages/CarouselPage";
import ChatEmptyPage from "./pages/ChatEmptyPage";
import ChatMessagePage from "./pages/ChatMessagePage";
import ChatProfilePage from "./pages/ChatProfilePage";
import CodeGeneratorNewPage from "./pages/CodeGeneratorNewPage";
import CodeGeneratorPage from "./pages/CodeGeneratorPage";
import ColorsPage from "./pages/ColorsPage";
import ColumnChartPage from "./pages/ColumnChartPage";
import CompanyPage from "./pages/CompanyPage";
import CurrenciesPage from "./pages/CurrenciesPage";
import DropdownPage from "./pages/DropdownPage";
import ErrorPage from "./pages/ErrorPage";
import FaqPage from "./pages/FaqPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import FormLayoutPage from "./pages/FormLayoutPage";
import FormValidationPage from "./pages/FormValidationPage";
import FormPage from "./pages/FormPage";
import GalleryPage from "./pages/GalleryPage";
import ImageGeneratorPage from "./pages/ImageGeneratorPage";
import ImageUploadPage from "./pages/ImageUploadPage";
import InvoiceAddPage from "./pages/InvoiceAddPage";
import InvoiceEditPage from "./pages/InvoiceEditPage";
import InvoiceListPage from "./pages/InvoiceListPage";
import InvoicePreviewPage from "./pages/InvoicePreviewPage";
import KanbanPage from "./pages/KanbanPage";
import LanguagePage from "./pages/LanguagePage";
import LineChartPage from "./pages/LineChartPage";
import ListPage from "./pages/ListPage";
import MarketplaceDetailsPage from "./pages/MarketplaceDetailsPage";
import MarketplacePage from "./pages/MarketplacePage";
import NotificationAlertPage from "./pages/NotificationAlertPage";
import NotificationPage from "./pages/NotificationPage";
import PaginationPage from "./pages/PaginationPage";
import PaymentGatewayPage from "./pages/PaymentGatewayPage";
import PieChartPage from "./pages/PieChartPage";
import PortfolioPage from "./pages/PortfolioPage";
import PricingPage from "./pages/PricingPage";
import ProgressPage from "./pages/ProgressPage";
import RadioPage from "./pages/RadioPage";
import RoleAccessPage from "./pages/RoleAccessPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import StarRatingPage from "./pages/StarRatingPage";
import StarredPage from "./pages/StarredPage";
import SwitchPage from "./pages/SwitchPage";
import TableBasicPage from "./pages/TableBasicPage";
import TableDataPage from "./pages/TableDataPage";
import TabsPage from "./pages/TabsPage";
import TagsPage from "./pages/TagsPage";
import TermsConditionPage from "./pages/TermsConditionPage";
import TextGeneratorPage from "./pages/TextGeneratorPage";
import ThemePage from "./pages/ThemePage";
import TooltipPage from "./pages/TooltipPage";
import TypographyPage from "./pages/TypographyPage";
import UsersGridPage from "./pages/UsersGridPage";
import UsersListPage from "./pages/UsersListPage";
import ViewDetailsPage from "./pages/ViewDetailsPage";
import VideoGeneratorPage from "./pages/VideoGeneratorPage";
import VideosPage from "./pages/VideosPage";
import ViewProfilePage from "./pages/ViewProfilePage";
import VoiceGeneratorPage from "./pages/VoiceGeneratorPage";
import WalletPage from "./pages/WalletPage";
import WidgetsPage from "./pages/WidgetsPage";
import WizardPage from "./pages/WizardPage";
import RouteScrollToTop from "./helper/RouteScrollToTop";
import TextGeneratorNewPage from "./pages/TextGeneratorNewPage";
import HomePageEight from "./pages/HomePageEight";
import HomePageNine from "./pages/HomePageNine";
import HomePageTen from "./pages/HomePageTen";
import HomePageEleven from "./pages/HomePageEleven";
import GalleryGridPage from "./pages/GalleryGridPage";
import GalleryMasonryPage from "./pages/GalleryMasonryPage";
import GalleryHoverPage from "./pages/GalleryHoverPage";
import CategoriesListPage from "./pages/CategoriesListPage";
import AddCategoryPage from "./pages/AddCategoryPage";
import EditCategoryPage from "./pages/EditCategoryPage";
import AttributesListPage from "./pages/AttributesListPage";
import AddAttributePage from "./pages/AddAttributePage";
import EditAttributePage from "./pages/EditAttributePage";
import BrandsListPage from "./pages/BrandsListPage";
import AddBrandPage from "./pages/AddBrandPage";
import EditBrandPage from "./pages/EditBrandPage";
import ProductsListPage from "./pages/ProductsListPage";
import AddProductPage from "./pages/AddProductPage";
import EditProductPage from "./pages/EditProductPage";
import VariantsListPage from "./pages/VariantsListPage";
import AddVariantPage from "./pages/AddVariantPage";
import EditVariantPage from "./pages/EditVariantPage";
import ProductGalleryPage from "./pages/ProductGalleryPage";
import StockManagementPage from "./pages/StockManagementPage";
import TagsListPage from "./pages/TagsListPage";
import AddTagPage from "./pages/AddTagPage";
import EditTagPage from "./pages/EditTagPage";
import ProductFaqsListPage from "./pages/ProductFaqsListPage";
import AddProductFaqPage from "./pages/AddProductFaqPage";
import EditProductFaqPage from "./pages/EditProductFaqPage";
import ProductSeoListPage from "./pages/ProductSeoListPage";
import AddProductSeoPage from "./pages/AddProductSeoPage";
import EditProductSeoPage from "./pages/EditProductSeoPage";
import ProductPricingListPage from "./pages/ProductPricingListPage";
import AddProductPricingPage from "./pages/AddProductPricingPage";
import EditProductPricingPage from "./pages/EditProductPricingPage";
import TierPricingListPage from "./pages/TierPricingListPage";
import AddTierPricingPage from "./pages/AddTierPricingPage";
import EditTierPricingPage from "./pages/EditTierPricingPage";
import PaymentMethodsListPage from "./pages/PaymentMethodsListPage";
import AddPaymentMethodPage from "./pages/AddPaymentMethodPage";
import EditPaymentMethodPage from "./pages/EditPaymentMethodPage";
import PaymentTransactionsListPage from "./pages/PaymentTransactionsListPage";
import ViewPaymentTransactionPage from "./pages/ViewPaymentTransactionPage";
import AddPaymentTransactionPage from "./pages/AddPaymentTransactionPage";
import EditPaymentTransactionPage from "./pages/EditPaymentTransactionPage";
import SpecialPricingListPage from "./pages/SpecialPricingListPage";
import AddSpecialPricingPage from "./pages/AddSpecialPricingPage";
import EditSpecialPricingPage from "./pages/EditSpecialPricingPage";
import TaxRuleListPage from "./pages/TaxRuleListPage";
import AddTaxRulePage from "./pages/AddTaxRulePage";
import EditTaxRulePage from "./pages/EditTaxRulePage";
import CouponListPage from "./pages/CouponListPage";
import AddCouponPage from "./pages/AddCouponPage";
import EditCouponPage from "./pages/EditCouponPage";
import AutoDiscountListPage from "./pages/AutoDiscountListPage";
import AddAutoDiscountPage from "./pages/AddAutoDiscountPage";
import EditAutoDiscountPage from "./pages/EditAutoDiscountPage";
import BuyXGetYListPage from "./pages/BuyXGetYListPage";
import AddBuyXGetYPage from "./pages/AddBuyXGetYPage";
import EditBuyXGetYPage from "./pages/EditBuyXGetYPage";
import FlashSaleListPage from "./pages/FlashSaleListPage";
import AddFlashSalePage from "./pages/AddFlashSalePage";
import EditFlashSalePage from "./pages/EditFlashSalePage";
import ComboOfferListPage from "./pages/ComboOfferListPage";
import AddComboOfferPage from "./pages/AddComboOfferPage";
import EditComboOfferPage from "./pages/EditComboOfferPage";
import CartPage from "./pages/CartPage";
import ShippingRuleListPage from "./pages/ShippingRuleListPage";
import AddShippingRulePage from "./pages/AddShippingRulePage";
import EditShippingRulePage from "./pages/EditShippingRulePage";
import AddressListPage from "./pages/AddressListPage";
import AddAddressPage from "./pages/AddAddressPage";
import EditAddressPage from "./pages/EditAddressPage";
import BlogPage from "./pages/BlogPage";
import BlogDetailsPage from "./pages/BlogDetailsPage";
import AddBlogPage from "./pages/AddBlogPage";
import TestimonialsPage from "./pages/TestimonialsPage";
import ComingSoonPage from "./pages/ComingSoonPage";
import AccessDeniedPage from "./pages/AccessDeniedPage";
import MaintenancePage from "./pages/MaintenancePage";
import BlankPagePage from "./pages/BlankPagePage";
import OrderHistoryListPage from "./pages/OrderHistoryListPage";
import AddOrderHistoryPage from "./pages/AddOrderHistoryPage";
import EditOrderHistoryPage from "./pages/EditOrderHistoryPage";
import ViewOrderHistoryPage from "./pages/ViewOrderHistoryPage";
import OrderReturnListPage from "./pages/OrderReturnListPage";
import AddOrderReturnPage from "./pages/AddOrderReturnPage";
import EditOrderReturnPage from "./pages/EditOrderReturnPage";
import ViewOrderReturnPage from "./pages/ViewOrderReturnPage";
import OrderReplacementListPage from "./pages/OrderReplacementListPage";
import AddOrderReplacementPage from "./pages/AddOrderReplacementPage";
import EditOrderReplacementPage from "./pages/EditOrderReplacementPage";
import ViewOrderReplacementPage from "./pages/ViewOrderReplacementPage";
import ListReturnPage from "./pages/ListReturnPage";
import AddReturnPage from "./pages/AddReturnPage";
import EditReturnPage from "./pages/EditReturnPage";
import ViewReturnPage from "./pages/ViewReturnPage";

function App() {
  return (
    <BrowserRouter>
      <RouteScrollToTop />
      <Routes>
        <Route exact path="/" element={<HomePageOne />} />

        <Route exact path="/index-3" element={<HomePageThree />} />

        {/* SL */}
        <Route exact path="/add-user" element={<AddUserPage />} />
        <Route exact path="/alert" element={<AlertPage />} />
        <Route exact path="/assign-role" element={<AssignRolePage />} />
        <Route exact path="/avatar" element={<AvatarPage />} />
        <Route exact path="/badges" element={<BadgesPage />} />
        <Route exact path="/button" element={<ButtonPage />} />
        <Route exact path="/calendar-main" element={<CalendarMainPage />} />
        <Route exact path="/calendar" element={<CalendarMainPage />} />
        <Route exact path="/card" element={<CardPage />} />
        <Route exact path="/carousel" element={<CarouselPage />} />
        <Route exact path="/chat-empty" element={<ChatEmptyPage />} />
        <Route exact path="/chat-message" element={<ChatMessagePage />} />
        <Route exact path="/chat-profile" element={<ChatProfilePage />} />
        <Route exact path="/code-generator" element={<CodeGeneratorPage />} />
        <Route
          exact
          path="/code-generator-new"
          element={<CodeGeneratorNewPage />}
        />
        <Route exact path="/colors" element={<ColorsPage />} />
        <Route exact path="/column-chart" element={<ColumnChartPage />} />
        <Route exact path="/company" element={<CompanyPage />} />
        <Route exact path="/currencies" element={<CurrenciesPage />} />
        <Route exact path="/dropdown" element={<DropdownPage />} />
        <Route exact path="/email" element={<EmailPage />} />
        <Route exact path="/faq" element={<FaqPage />} />
        <Route exact path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route exact path="/form-layout" element={<FormLayoutPage />} />
        <Route exact path="/form-validation" element={<FormValidationPage />} />
        <Route exact path="/form" element={<FormPage />} />

        <Route exact path="/gallery" element={<GalleryPage />} />
        <Route exact path="/gallery-grid" element={<GalleryGridPage />} />
        <Route exact path="/gallery-masonry" element={<GalleryMasonryPage />} />
        <Route exact path="/gallery-hover" element={<GalleryHoverPage />} />

        <Route exact path="/blog" element={<BlogPage />} />
        <Route exact path="/blog-details" element={<BlogDetailsPage />} />
        <Route exact path="/add-blog" element={<AddBlogPage />} />

        <Route exact path="/testimonials" element={<TestimonialsPage />} />
        <Route exact path="/coming-soon" element={<ComingSoonPage />} />
        <Route exact path="/access-denied" element={<AccessDeniedPage />} />
        <Route exact path="/maintenance" element={<MaintenancePage />} />
        <Route exact path="/blank-page" element={<BlankPagePage />} />

        <Route exact path="/image-generator" element={<ImageGeneratorPage />} />
        <Route exact path="/image-upload" element={<ImageUploadPage />} />
        <Route exact path="/invoice-add" element={<InvoiceAddPage />} />
        <Route exact path="/invoice-edit" element={<InvoiceEditPage />} />
        <Route exact path="/invoice-list" element={<InvoiceListPage />} />
        <Route exact path="/invoice-preview" element={<InvoicePreviewPage />} />
        <Route exact path="/kanban" element={<KanbanPage />} />
        <Route exact path="/language" element={<LanguagePage />} />
        <Route exact path="/line-chart" element={<LineChartPage />} />
        <Route exact path="/list" element={<ListPage />} />
        <Route
          exact
          path="/marketplace-details"
          element={<MarketplaceDetailsPage />}
        />
        <Route exact path="/marketplace" element={<MarketplacePage />} />
        <Route
          exact
          path="/notification-alert"
          element={<NotificationAlertPage />}
        />
        <Route exact path="/notification" element={<NotificationPage />} />
        <Route exact path="/pagination" element={<PaginationPage />} />
        <Route exact path="/payment-gateway" element={<PaymentGatewayPage />} />
        <Route exact path="/pie-chart" element={<PieChartPage />} />
        <Route exact path="/portfolio" element={<PortfolioPage />} />
        <Route exact path="/pricing" element={<PricingPage />} />
        <Route exact path="/progress" element={<ProgressPage />} />
        <Route exact path="/radio" element={<RadioPage />} />
        <Route exact path="/role-access" element={<RoleAccessPage />} />
        <Route exact path="/sign-in" element={<SignInPage />} />
        <Route exact path="/sign-up" element={<SignUpPage />} />
        <Route exact path="/star-rating" element={<StarRatingPage />} />
        <Route exact path="/starred" element={<StarredPage />} />
        <Route exact path="/switch" element={<SwitchPage />} />
        <Route exact path="/table-basic" element={<TableBasicPage />} />
        <Route exact path="/table-data" element={<TableDataPage />} />
        <Route exact path="/tabs" element={<TabsPage />} />
        <Route exact path="/tags" element={<TagsPage />} />
        <Route exact path="/terms-condition" element={<TermsConditionPage />} />
        <Route
          exact
          path="/text-generator-new"
          element={<TextGeneratorNewPage />}
        />
        <Route exact path="/text-generator" element={<TextGeneratorPage />} />
        <Route exact path="/theme" element={<ThemePage />} />
        <Route exact path="/tooltip" element={<TooltipPage />} />
        <Route exact path="/typography" element={<TypographyPage />} />
        <Route exact path="/users-grid" element={<UsersGridPage />} />
        <Route exact path="/users-list" element={<UsersListPage />} />
        <Route exact path="/view-details" element={<ViewDetailsPage />} />
        <Route exact path="/video-generator" element={<VideoGeneratorPage />} />
        <Route exact path="/videos" element={<VideosPage />} />
        <Route exact path="/view-profile" element={<ViewProfilePage />} />
        <Route exact path="/voice-generator" element={<VoiceGeneratorPage />} />
        <Route exact path="/wallet" element={<WalletPage />} />
        <Route exact path="/widgets" element={<WidgetsPage />} />
        <Route exact path="/wizard" element={<WizardPage />} />

        {/* Category Routes */}
        <Route exact path="/categories-list" element={<CategoriesListPage />} />
        <Route exact path="/add-category" element={<AddCategoryPage />} />
        <Route exact path="/edit-category/:id" element={<EditCategoryPage />} />

        {/* Attribute Routes */}
        <Route exact path="/attributes-list" element={<AttributesListPage />} />
        <Route exact path="/add-attribute" element={<AddAttributePage />} />
        <Route
          exact
          path="/edit-attribute/:id"
          element={<EditAttributePage />}
        />

        {/* Brand Routes */}
        <Route exact path="/brands-list" element={<BrandsListPage />} />
        <Route exact path="/add-brand" element={<AddBrandPage />} />
        <Route exact path="/edit-brand/:id" element={<EditBrandPage />} />

        {/* Product Routes */}
        <Route exact path="/products-list" element={<ProductsListPage />} />
        <Route exact path="/add-product" element={<AddProductPage />} />
        <Route exact path="/edit-product/:id" element={<EditProductPage />} />

        {/* Variant Routes */}
        <Route exact path="/variants-list" element={<VariantsListPage />} />
        <Route exact path="/add-variant" element={<AddVariantPage />} />
        <Route exact path="/edit-variant/:id" element={<EditVariantPage />} />

        {/* Product Gallery Route */}
        <Route exact path="/product-gallery" element={<ProductGalleryPage />} />

        {/* Stock Management Route */}
        <Route
          exact
          path="/stock-management"
          element={<StockManagementPage />}
        />

        {/* Tag Routes */}
        <Route exact path="/tags-list" element={<TagsListPage />} />
        <Route exact path="/add-tag" element={<AddTagPage />} />
        <Route exact path="/edit-tag/:id" element={<EditTagPage />} />

        {/* Product FAQ Routes */}
        <Route exact path="/faqs-list" element={<ProductFaqsListPage />} />
        <Route exact path="/add-faq" element={<AddProductFaqPage />} />
        <Route exact path="/edit-faq/:id" element={<EditProductFaqPage />} />

        {/* Product SEO Routes */}
        <Route
          exact
          path="/product-seo-list"
          element={<ProductSeoListPage />}
        />
        <Route exact path="/add-product-seo" element={<AddProductSeoPage />} />
        <Route
          exact
          path="/edit-product-seo/:id"
          element={<EditProductSeoPage />}
        />

        {/* Product Pricing Routes */}
        <Route
          exact
          path="/product-pricing-list"
          element={<ProductPricingListPage />}
        />
        <Route
          exact
          path="/add-product-pricing"
          element={<AddProductPricingPage />}
        />
        <Route
          exact
          path="/edit-product-pricing/:id"
          element={<EditProductPricingPage />}
        />

        {/* Tier Pricing Routes */}
        <Route
          exact
          path="/tier-pricing-list"
          element={<TierPricingListPage />}
        />
        <Route
          exact
          path="/add-tier-pricing"
          element={<AddTierPricingPage />}
        />
        <Route
          exact
          path="/edit-tier-pricing/:id"
          element={<EditTierPricingPage />}
        />

        {/* Payment Methods Routes */}
        <Route
          exact
          path="/payment-methods"
          element={<PaymentMethodsListPage />}
        />
        <Route
          exact
          path="/add-payment-method"
          element={<AddPaymentMethodPage />}
        />
        <Route
          exact
          path="/edit-payment-method/:id"
          element={<EditPaymentMethodPage />}
        />

        {/* Payment Transactions Routes */}
        <Route
          exact
          path="/payment-transactions"
          element={<PaymentTransactionsListPage />}
        />
        <Route
          exact
          path="/add-payment-transaction"
          element={<AddPaymentTransactionPage />}
        />
        <Route
          exact
          path="/edit-payment-transaction/:id"
          element={<EditPaymentTransactionPage />}
        />
        <Route
          exact
          path="/view-payment-transaction/:id"
          element={<ViewPaymentTransactionPage />}
        />

        {/* Order History Routes */}
        <Route exact path="/order-history" element={<OrderHistoryListPage />} />
        <Route
          exact
          path="/add-order-history"
          element={<AddOrderHistoryPage />}
        />
        <Route
          exact
          path="/edit-order-history/:id"
          element={<EditOrderHistoryPage />}
        />
        <Route
          exact
          path="/view-order-history/:id"
          element={<ViewOrderHistoryPage />}
        />

        {/* Order Return Routes */}
        <Route exact path="/order-returns" element={<OrderReturnListPage />} />
        <Route
          exact
          path="/add-order-return"
          element={<AddOrderReturnPage />}
        />
        <Route
          exact
          path="/edit-order-return/:id"
          element={<EditOrderReturnPage />}
        />
        <Route
          exact
          path="/view-order-return/:id"
          element={<ViewOrderReturnPage />}
        />

        {/* Order Replacement Routes */}
        <Route
          exact
          path="/order-replacements"
          element={<OrderReplacementListPage />}
        />
        <Route
          exact
          path="/add-order-replacement"
          element={<AddOrderReplacementPage />}
        />
        <Route
          exact
          path="/edit-order-replacement/:id"
          element={<EditOrderReplacementPage />}
        />
        <Route
          exact
          path="/view-order-replacement/:id"
          element={<ViewOrderReplacementPage />}
        />

        {/* Returns & Refunds Routes */}
        <Route exact path="/returns" element={<ListReturnPage />} />
        <Route exact path="/add-return" element={<AddReturnPage />} />
        <Route exact path="/edit-return/:id" element={<EditReturnPage />} />
        <Route exact path="/view-return/:id" element={<ViewReturnPage />} />

        {/* Special Pricing Routes */}
        <Route
          exact
          path="/special-pricing-list"
          element={<SpecialPricingListPage />}
        />
        <Route
          exact
          path="/add-special-pricing"
          element={<AddSpecialPricingPage />}
        />
        <Route
          exact
          path="/edit-special-pricing/:id"
          element={<EditSpecialPricingPage />}
        />

        {/* Tax Rules Routes */}
        <Route exact path="/tax-rules-list" element={<TaxRuleListPage />} />
        <Route exact path="/add-tax-rule" element={<AddTaxRulePage />} />
        <Route exact path="/edit-tax-rule/:id" element={<EditTaxRulePage />} />
        <Route exact path="/coupons-list" element={<CouponListPage />} />
        <Route exact path="/add-coupon" element={<AddCouponPage />} />
        <Route exact path="/edit-coupon/:id" element={<EditCouponPage />} />
        <Route
          exact
          path="/auto-discounts-list"
          element={<AutoDiscountListPage />}
        />
        <Route
          exact
          path="/add-auto-discount"
          element={<AddAutoDiscountPage />}
        />
        <Route
          exact
          path="/edit-auto-discount/:id"
          element={<EditAutoDiscountPage />}
        />
        <Route exact path="/buy-x-get-y-list" element={<BuyXGetYListPage />} />
        <Route exact path="/add-buy-x-get-y" element={<AddBuyXGetYPage />} />
        <Route
          exact
          path="/edit-buy-x-get-y/:id"
          element={<EditBuyXGetYPage />}
        />
        <Route exact path="/flash-sales-list" element={<FlashSaleListPage />} />
        <Route exact path="/add-flash-sale" element={<AddFlashSalePage />} />
        <Route
          exact
          path="/edit-flash-sale/:id"
          element={<EditFlashSalePage />}
        />
        <Route
          exact
          path="/combo-offers-list"
          element={<ComboOfferListPage />}
        />
        <Route exact path="/add-combo-offer" element={<AddComboOfferPage />} />
        <Route
          exact
          path="/edit-combo-offer/:id"
          element={<EditComboOfferPage />}
        />
        <Route exact path="/cart" element={<CartPage />} />

        {/* Shipping Rules Routes */}
        <Route
          exact
          path="/shipping-rules-list"
          element={<ShippingRuleListPage />}
        />
        <Route
          exact
          path="/add-shipping-rule"
          element={<AddShippingRulePage />}
        />
        <Route
          exact
          path="/edit-shipping-rule/:id"
          element={<EditShippingRulePage />}
        />

        {/* Address Routes */}
        <Route exact path="/addresses-list" element={<AddressListPage />} />
        <Route exact path="/add-address" element={<AddAddressPage />} />
        <Route exact path="/edit-address/:id" element={<EditAddressPage />} />

        <Route exact path="*" element={<ErrorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

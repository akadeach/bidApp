// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.9.0;

contract Auction {
    address public admin;
    uint256 bidderCount;
    uint256 biddingCount;
    bool start;
    bool end;

    constructor() public {
        // Initilizing default values
        admin = msg.sender;
        bidderCount = 0;
        biddingCount = 0;
        start = false;
        end = false;
    }

    function getAdmin() public view returns (address) {
        // Returns account address used to deploy contract (i.e. admin)
        return admin;
    }

    modifier onlyAdmin() {
        // Modifier for only admin access
        require(msg.sender == admin);
        _;
    }

    // Modeling a Auction Details
    struct AuctionDetails {
        string adminName;
        string adminEmail;
        string adminTitle;
        string auctionTitle;
        string organizationTitle;
        string auctionDetail;
        string middlePrice;
    }
    AuctionDetails auctionDetails;

    function setAuctionDetails(
        string memory _adminName,
        string memory _adminEmail,
        string memory _adminTitle,
        string memory _auctionTitle,
        string memory _organizationTitle,
        string memory _auctionDetail,
        string memory _middlePrice
    )
        public
        // Only admin can add
        onlyAdmin
    {
        auctionDetails = AuctionDetails(
            _adminName,
            _adminEmail,
            _adminTitle,
            _auctionTitle,
            _organizationTitle,
            _auctionDetail,
            _middlePrice
        );
        start = true;
        end = false;
    }

    // Get Auctions details
    function getAuctionDetails()
        public
        view
        returns (
            string memory adminName,
            string memory adminEmail,
            string memory adminTitle,
            string memory auctionTitle,
            string memory organizationTitle,
            string memory auctionDetail,
            string memory middlePrice
        )
    {
        return (
            auctionDetails.adminName,
            auctionDetails.adminEmail,
            auctionDetails.adminTitle,
            auctionDetails.auctionTitle,
            auctionDetails.organizationTitle,
            auctionDetails.auctionDetail,
            auctionDetails.middlePrice
        );
    }

    // Get bidders count
    function getTotalBidder() public view returns (uint256) {
        // Returns total number of bidders
        return bidderCount;
    }

    // Verify bidder
    function verifyBidder(
        bool _verifedStatus,
        address bidderAddress
    )
        public
        // Only admin can verify
        onlyAdmin
    {
        bidderDetails[bidderAddress].isVerified = _verifedStatus;
    }

    // Modeling a bidder
    struct Bidder {
        address bidderAddress;
        string companyName;
        string taxNumber;
        string companyAddress;
        string name;
        string phone;
        bool isVerified;
        bool hasBided;
        bool isRegistered;
    }
    address[] public bidders; // Array of address to store address of bidders
    mapping(address => Bidder) public bidderDetails;

    // Request to be added as bidder
    function registerAsBidder(
        string memory _companyName,
        string memory _taxNumber,
        string memory _companyAddress,
        string memory _name,
        string memory _phone
    ) public {
        Bidder memory newBidder = Bidder({
            bidderAddress: msg.sender,
            companyName: _companyName,
            taxNumber: _taxNumber,
            companyAddress: _companyAddress,
            name: _name,
            phone: _phone,
            hasBided: false,
            isVerified: false,
            isRegistered: true
        });
        bidderDetails[msg.sender] = newBidder;
        bidders.push(msg.sender);
        bidderCount += 1;
    }

    // End auction
    function endAuction() public onlyAdmin {
        end = true;
        start = false;
    }

    // Get auction start and end values
    function getStart() public view returns (bool) {
        return start;
    }

    function getEnd() public view returns (bool) {
        return end;
    }

    // Get biddings count
    function getTotalBidding() public view returns (uint256) {
        // Returns total number of biddings
        return biddingCount;
    }

    // Modeling a bidding
    struct Bidding {
        address bidAddress;
        string bidDetail;
        string bidPrice;
        bool hasBided;
        bool isBided;
    }
    address[] public biddings; // Array of address to store address of biddings
    mapping(address => Bidding) public biddingDetails;

    // Request to be added as bidding
    function fillBidding(
        string memory _bidDetail,
        string memory _bidPrice
    ) public {
        Bidding memory newBidding = Bidding({
            bidAddress: msg.sender,
            bidDetail: _bidDetail,
            bidPrice: _bidPrice,
            hasBided: false,
            isBided: true
        });
        biddingDetails[msg.sender] = newBidding;
        biddings.push(msg.sender);
        biddingCount += 1;
    }

    // Verify bidder
    function verifyBidding(bool _bidedStatus, address bidAddress) public {
        bidderDetails[bidAddress].hasBided = _bidedStatus;
        biddingDetails[bidAddress].hasBided = _bidedStatus;
    }
}

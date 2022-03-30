// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

interface IERC20Token {
    function transfer(address, uint256) external returns (bool);

    function approve(address, uint256) external returns (bool);

    function transferFrom(
        address,
        address,
        uint256
    ) external returns (bool);

    function totalSupply() external view returns (uint256);

    function balanceOf(address) external view returns (uint256);

    function allowance(address, address) external view returns (uint256);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
}

contract Donater{
    struct Donate{
        address payable owner;
        string title;
        string  description;
        string  image;
        uint goal;
        uint amountDonated;
        bool goalReached;
    }


    mapping(uint256=>Donate) internal donations;
    uint256 donateLength = 0;

    address internal cUsdTokenAddress =
        0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;
    address internal adminAddress = 0xE2a0411465fd913502A8390Fe22DC7004AC47A04;

    function addDonation(
        string memory _title,
        string memory _description,
        string memory _image,
        uint _goal 
    )public payable{
        require(
             IERC20Token(cUsdTokenAddress).transferFrom(
                msg.sender,
                adminAddress,
                1e18
            ),
            "Transaction could not be performed"
        );
        donations[donateLength] = Donate(
            payable(msg.sender),
            _title,
            _description,
            _image,
            _goal,
            0,
            false
        );

        donateLength++;
    }

    function getDonation(uint _index)public view returns(
        address payable,
        string memory,
        string memory,
        string memory,
        uint,
        uint,
        bool
    ){
        Donate storage _donations = donations[_index];
        return(
            _donations.owner,
            _donations.title,
            _donations.description,
            _donations.image,
            _donations.goal,
            _donations.amountDonated,
            _donations.goalReached
        );
    }

    function donate(uint _index, uint amount)public payable {
        require(donations[_index].amountDonated < donations[_index].goal);
        require(
             IERC20Token(cUsdTokenAddress).transferFrom(
                msg.sender,
                donations[_index].owner,
                amount
            ),
            "Transaction could not be performed"
        );
        donations[_index].amountDonated+=amount;
        if(donations[_index].amountDonated >= donations[_index].goal){
            donations[_index].goalReached = true;
        }
    }

    function getDonationLength() public view returns (uint){
        return donateLength;
    }
}
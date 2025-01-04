import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { getShortForms } from '@/lib/getShortForm';

const prisma = new PrismaClient();

// Utility function for validation errors
function handleValidationError(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

async function generateUniqueCustomerId(baseId: string): Promise<string> {
  let counter = 1;
  let uniqueId = baseId;

  // Check if the customer ID already exists in the database
  while (await prisma.customer.findUnique({ where: { id: uniqueId } })) {
    const suffix = counter.toString().padStart(3, '0');
    uniqueId = ${baseId}-${suffix};
    counter++;
  }

  return uniqueId;
}


// Create a new Customer with Addresses
export async function POST(req: NextRequest,res:NextResponse) {
  try {
    const data = await req.json();

    // Validation checks
    if (!data.firstName) return handleValidationError('First name is required.');
    if (!data.lastName) return handleValidationError('Last name is required.');
    if (!data.customerDisplayName) return handleValidationError('Customer display name is required.');
    if (!data.billingAddress?.country) return handleValidationError('Billing address country is required.');
    if (!data.billingAddress?.state) return handleValidationError('Billing address state is required.');

    // Get abbreviations for country and region
    const { countryAbbr, regionAbbr } = getShortForms(data.billingAddress.country, data.billingAddress.region);

    // Generate unique customer ID
    const baseCustomerId = ${data.customerDisplayName.replace(/\s+/g, '')}-${countryAbbr}-${regionAbbr};

    // Ensure the customer ID is unique
    const customerId = await generateUniqueCustomerId(baseCustomerId);


    const newCustomer = await prisma.customer.create({
      data: {
        id: customerId,
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        companyName: data.companyName,
        customerDisplayName: data.customerDisplayName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        website: data.website,
        sameAsBilling : data.sameAsBilling,
        billingAddress: {
          create: data.billingAddress,
        },
        shippingAddress: {
          create: data.shippingAddress,
        },
      },
      include: {
        billingAddress: true,
        shippingAddress: true,
      },
    });

    return res.json(newCustomer, { status: 201 });
  } catch (error) {
    return handlePrismaError(error);
  }
}


// Get all Customers with their Addresses
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    
    // Pagination parameters
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    // Search by customerDisplayName or email
    const search = url.searchParams.get('search');

    // Filters: by country or region in billing address
    const country = url.searchParams.get('country');
    const region = url.searchParams.get('region');

    // Sorting parameters: field and order (asc/desc)
    const sortField = url.searchParams.get('sortField') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';

    // Construct Prisma where conditions for filtering
    const where: any = {};

    if (search) {
      where.OR = [
        { customerDisplayName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { firstName : { contains: search, mode: 'insensitive' } },
        { lastName : { contains: search, mode: 'insensitive' } },
        { middleName : { contains: search, mode: 'insensitive' } },
      ];
    }

    if (country || region) {
      where.billingAddress = {
        country: country ? { equals: country, mode: 'insensitive' } : undefined,
        region: region ? { equals: region, mode: 'insensitive' } : undefined,
      };
    }

    // Fetch customers with filters, search, pagination, and sorting applied
    const customers = await prisma.customer.findMany({
      where,
      include: {
        billingAddress: true,
        shippingAddress: true,
      },
      orderBy: {
        [sortField]: sortOrder,
      },
      skip,
      take: limit,
    });

    // Get total count for pagination info
    const totalCount = await prisma.customer.count({ where });

    return NextResponse.json(
      {
        data: customers,
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      { status: 200 }
    );
  } catch (error) {
    return handlePrismaError(error);
  }
}

// Update a Customer by ID
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { id, ...updateData } = data;

    if (!id) return handleValidationError('Customer ID is required for update.');

    console.log('====================================');
    console.log(updateData.sameAsBilling);
    console.log('====================================');

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: {
        ...updateData,
        billingAddress: updateData.billingAddress
          ? { update: updateData.billingAddress }
          : undefined,
        shippingAddress: updateData.shippingAddress
          ? { update: updateData.shippingAddress }
          : undefined,
      },
      include: {
        billingAddress: true,
        shippingAddress: true,
      },
    });

    return NextResponse.json(updatedCustomer, { status: 200 });
  } catch (error) {
    return handlePrismaError(error);
  }
}

// Delete a Customer by ID
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return handleValidationError('Customer ID is required for deletion.');

    await prisma.customer.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Customer deleted successfully' }, { status: 200 });
  } catch (error) {
    return handlePrismaError(error);
  }
}

// Handle Prisma-specific errors
function handlePrismaError(error: any) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return NextResponse.json(
          { error: 'A customer with this display name already exists.' },
          { status: 409 }
        );
      case 'P2025':
        return NextResponse.json(
          { error: 'Record not found. Unable to complete the operation.' },
          { status: 404 }
        );
      default:
        return NextResponse.json(
          { error: Prisma error: ${error.message} },
          { status: 500 }
        );
    }
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    return NextResponse.json(
      { error: Validation error: ${error.message} },
      { status: 400 }
    );
  } else {
    return NextResponse.json(
      { error: Server error: ${error.message} },
      { status: 500 }
    );
  }
}